/**
 * Module: Spotify API Scraper
 * Description: Menangani request ke API pihak ketiga dengan teknik Header Spoofing
 * Role: API Reverse Engineering & Web Scraping
 */

const fetch = require('node-fetch'); // Jika Anda pakai Node.js v18+, require ini bisa dihapus
const axios = require('axios');
const { shannz: cf } = require('bycf');

// Header Spoofing untuk menghindari pemblokiran WAF / Cloudflare dari API target
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://api.nexray.web.id/',
    // Client Hints untuk bypass deteksi bot tingkat lanjut
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin'
};

// --- CONFIG FALLBACK API (SpotiDownloader) ---
const fallbackConfig = {
    BASE_URL: "https://api.spotidownloader.com",
    SITE_KEY: "0x4AAAAAAA8QAiFfE5GuBRRS",
    HEADERS: {
        'User-Agent': 'ScRaPe/9.9 (KaliLinux; Nusantara Os; My/Shannz)',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://spotidownloader.com',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://spotidownloader.com/',
        'accept-language': 'id,en-US;q=0.9,en;q=0.8',
        'priority': 'u=1, i'
    }
};

const getTrackId = (url) => {
    const match = url.match(/(?:track|id)\/([a-zA-Z0-9]{22})/);
    return match ? match[1] : url;
};

// Helper Session untuk API Fallback
const getFallbackSession = async () => {
    try {
        const turnstileToken = await cf.turnstileMin(
            fallbackConfig.BASE_URL + "/session",
            fallbackConfig.SITE_KEY,
            null
        );

        if (!turnstileToken) throw new Error("Gagal generate Turnstile token");

        const { data } = await axios.post(
            `${fallbackConfig.BASE_URL}/session`,
            { token: turnstileToken },
            { headers: fallbackConfig.HEADERS }
        );

        return data.token;
    } catch (error) {
        console.error(`[Spotify Fallback] Error Get Session: ${error.message}`);
        return null;
    }
};

const spotify = {
    /**
     * Mencari lagu di Spotify
     * @param {string} query - Judul lagu atau artis
     * @returns {Promise<Object>} Object balasan dengan status dan array data
     */
    search: async (query) => {
        try {
            const url = `https://api.nexray.web.id/search/spotify?q=${encodeURIComponent(query)}`;
            const response = await fetch(url, { method: 'GET', headers: headers });
            
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            
            const res = await response.json();
            const tracks = res.result || res.data || (Array.isArray(res) ? res : []);
            
            if (!tracks || tracks.length === 0) return { status: false, msg: 'Lagu tidak ditemukan.' };
            
            return { status: true, data: tracks };
        } catch (error) {
            console.error('[Spotify Search Error]', error);
            return { status: false, msg: error.message };
        }
    },

    /**
     * Fallback Downloader jika API Utama mati (Menggunakan SpotiDownloader)
     * @param {string} urlOrId - Link/ID Track Spotify
     */
    downloadFallback: async (urlOrId) => {
        try {
            console.log('[Spotify] Menggunakan API Fallback (SpotiDownloader)...');
            const trackId = getTrackId(urlOrId);
            const token = await getFallbackSession();
            
            if (!token) return { status: false, msg: 'Gagal mendapatkan sesi Turnstile fallback.' };

            const authHeaders = {
                ...fallbackConfig.HEADERS,
                'Authorization': `Bearer ${token}`
            };

            const metaRes = await axios.post(
                `${fallbackConfig.BASE_URL}/metadata`,
                { type: "track", id: trackId },
                { headers: authHeaders }
            );
            
            const metadata = metaRes.data;
            if (!metadata.success) return { status: false, msg: 'Metadata tidak ditemukan di Fallback.' };

            let isFlac = false;
            try {
                const flacRes = await axios.post(
                    `${fallbackConfig.BASE_URL}/isFlacAvailable`,
                    { id: trackId },
                    { headers: authHeaders }
                );
                isFlac = flacRes.data.flacAvailable;
            } catch (e) { }

            const downRes = await axios.post(
                `${fallbackConfig.BASE_URL}/download`,
                { id: trackId },
                { headers: authHeaders }
            );

            return {
                status: true,
                metadata: {
                    title: metadata.title,
                    artist: metadata.artists,
                    album: metadata.album,
                    cover: metadata.cover,
                    releaseDate: metadata.releaseDate,
                    isFlacAvailable: isFlac
                },
                download: {
                    mp3: downRes.data.link,
                    flac: downRes.data.linkFlac || null
                }
            };
        } catch (error) {
            console.error(`[Spotify Fallback Error]: ${error.message}`);
            return { status: false, msg: error.message };
        }
    },

    /**
     * Mengunduh metadata dan URL audio Spotify (Memprioritaskan API Utama)
     * @param {string} url - Link valid Spotify Track
     * @returns {Promise<Object>} Object balasan dengan metadata standar
     */
    download: async (url) => {
        try {
            const apiUrl = `https://api.nexray.web.id/downloader/spotify?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl, { method: 'GET', headers: headers });
            
            if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
            
            const res = await response.json();
            
            if (!res.status || !res.result) throw new Error('Data gagal diekstrak dari API Utama.');
            
            const data = res.result;
            
            return {
                status: true,
                metadata: {
                    title: data.title || data.name || 'Unknown Title',
                    artist: data.artist || data.artists || 'Unknown Artist',
                    album: data.album || '-',
                    cover: data.image || data.thumbnail || data.cover || 'https://telegra.ph/file/70e8de9b1879568954f09.jpg',
                    releaseDate: data.releaseDate || data.publish || 'Tidak diketahui'
                },
                download: {
                    mp3: data.url || data.link
                }
            };
        } catch (error) {
            console.error('[Spotify Primary API Error]:', error.message, '--> Beralih ke Fallback...');
            
            // Mengeksekusi Fallback jika API Utama gagal
            return await spotify.downloadFallback(url);
        }
    }
};

module.exports = spotify;