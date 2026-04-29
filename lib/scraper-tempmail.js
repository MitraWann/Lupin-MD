/**
 * Scraper: Tempmail (akunlama.com)
 * Lokasi: /lib/scraper-tempmail.js
 * Fungsi: Bypass API & Web Scraping untuk AkunLama
 */

const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://akunlama.com';

// Header Spoofing untuk menghindari blokir anti-bot/Cloudflare
const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://akunlama.com/',
    'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36'
};

// --- HELPER FUNCTIONS ---
const generateRecipient = () => crypto.randomBytes(8).toString('hex').substring(0, 10);
const extractToken = (html) => html.match(/token=([^"&\\]+)/)?.[1];
const cleanHtml = (html) => {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Hapus tag style
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Hapus tag script
        .replace(/<[^>]*>/g, '') // Hapus semua tag HTML
        .replace(/\s+/g, ' ') // Rapikan spasi berlebih
        .trim();
};

// --- MAIN SCRAPER LOGIC ---
const getInbox = async (recipient) => {
    try {
        // Ambil list pesan
        const { data: inbox } = await axios.get(`${BASE_URL}/api/list`, {
            params: { recipient },
            headers: { ...headers, referer: `https://akunlama.com/inbox/${recipient}/list` }
        });

        if (!inbox || inbox.length === 0) return { status: false, total: 0, messages: [] };

        let messages = [];
        let limit = Math.min(inbox.length, 5); // Ambil maksimal 5 pesan terbaru

        for (let i = 0; i < limit; i++) {
            let msgData = inbox[i];
            
            // Ambil detail pesan (HTML)
            const { data: html } = await axios.get(`${BASE_URL}/api/getHtml`, {
                params: { region: msgData.storage.region, key: msgData.storage.key },
                headers: { ...headers, referer: `https://akunlama.com/inbox/${recipient}/message/${msgData.storage.region}/${msgData.storage.key}` }
            });

            messages.push({
                from: msgData.message?.headers?.from || 'Tidak diketahui',
                subject: msgData.message?.headers?.subject || 'Tidak ada subjek',
                token: extractToken(html),
                text: cleanHtml(html)
            });
        }

        return { 
            status: true, 
            total: inbox.length, 
            messages 
        };
    } catch (error) {
        console.error("Scraper Tempmail Error:", error.message);
        throw error; // Lempar error agar ditangkap oleh blok try-catch di plugin
    }
};

module.exports = { generateRecipient, getInbox };