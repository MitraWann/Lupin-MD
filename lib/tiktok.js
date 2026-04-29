const axios = require('axios');
const cheerio = require('cheerio');

// ==========================================
// API 1: TikWM (Mendukung Video, Slide & Audio)
// ==========================================
async function api1_tikwm(url) {
    const { data } = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01'
        }
    });
    
    if (!data || !data.data) throw new Error('API1 (TikWM) gagal: Data tidak ditemukan');
    
    return {
        video: data.data.play || null,
        images: data.data.images || [], 
        audio: data.data.music || (data.data.music_info ? data.data.music_info.play : null), 
        title: data.data.title || "TikTok Video",
        author: data.data.author?.nickname || "Unknown"
    };
}

// ==========================================
// API 2: SaveTT (Mendukung Video, Slide & Audio) - Bypass WAF
// ==========================================
const savettHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Origin': 'https://savett.cc',
    'Referer': 'https://savett.cc/en1/download',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"'
};

async function api2_savett(url) {
    // 1. Ambil Token CSRF dan Cookie
    const res = await axios.get('https://savett.cc/en1/download', { headers: savettHeaders });
    const csrf = res.data.match(/name="csrf_token" value="([^"]+)"/)?.[1];
    const cookie = res.headers['set-cookie']?.map(v => v.split(';')[0]).join('; ') || '';

    if (!csrf) throw new Error('API2 (SaveTT) gagal: CSRF Token tidak ditemukan');

    // 2. Fetch Data Video
    const postRes = await axios.post(
        'https://savett.cc/en1/download',
        `csrf_token=${encodeURIComponent(csrf)}&url=${encodeURIComponent(url)}`,
        { headers: { ...savettHeaders, Cookie: cookie } }
    );

    // 3. Parsing Data HTML menggunakan Cheerio
    const $ = cheerio.load(postRes.data);
    const author = $('#video-info h3').first().text().trim() || 'Unknown';
    const title = $('#video-info p.text-muted').first().text().trim() || 'TikTok Video';

    let video = null;
    let images = [];
    let audio = null;

    // Ekstrak Slide Foto
    const slides = $('.carousel-item[data-data]');
    if (slides.length) {
        slides.each((_, el) => {
            try {
                const json = JSON.parse($(el).attr('data-data').replace(/&quot;/g, '"'));
                if (Array.isArray(json.URL) && json.URL.length > 0) {
                    images.push(json.URL[0]);
                }
            } catch {}
        });
    }

    // Ekstrak Video & Audio
    $('#formatselect option').each((_, el) => {
        const label = $(el).text().toLowerCase();
        const raw = $(el).attr('value');
        if (!raw) return;

        try {
            const json = JSON.parse(raw.replace(/&quot;/g, '"'));
            if (!json.URL || json.URL.length === 0) return;

            if (label.includes('mp4') && !label.includes('watermark')) {
                video = json.URL[0];
            }
            if (label.includes('mp3')) {
                audio = json.URL[0];
            }
        } catch {}
    });

    if (!video && images.length === 0 && !audio) {
        throw new Error('API2 (SaveTT) gagal: Media tidak ditemukan di halaman response');
    }

    return { video, images, audio, title, author };
}

// ==========================================
// API 3: TTDownloader (Fallback - Hanya Video)
// ==========================================
async function api3_ttdl(url) {
    const { data } = await axios.get(`https://ttdownloader.com/req/`, {
        params: { url },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    
    if (!data || !data.video) throw new Error('API3 (TTDownloader) gagal: Data tidak ditemukan');
    
    return {
        video: data.video,
        images: [], 
        audio: null, 
        title: "TikTok Video",
        author: "Unknown"
    };
}

// ==========================================
// MAIN DOWNLOADER WRAPPER
// ==========================================
/**
 * Mengeksekusi scraping TikTok dengan sistem fallback bertingkat
 * @param {string} url - Link TikTok
 * @returns {Promise<Object>} Object berisi data video, slide, dan audio
 */
async function tiktokDl(url) {
    let result;
    let errors = [];

    // Prioritas 1: TikWM (Cepat, format JSON native)
    try {
        result = await api1_tikwm(url);
        if (result && (result.video || result.images.length > 0)) return result;
    } catch (e) {
        errors.push(e.message);
    }

    // Prioritas 2: SaveTT (Bypass WAF, mendukung full media)
    try {
        result = await api2_savett(url);
        if (result && (result.video || result.images.length > 0 || result.audio)) return result;
    } catch (e) {
        errors.push(e.message);
    }

    // Prioritas 3: TTDownloader (Fallback paling mentok)
    try {
        result = await api3_ttdl(url);
        if (result && result.video) return result;
    } catch (e) {
        errors.push(e.message);
    }

    // Jika ketiganya gagal
    throw new Error(`Semua layanan scraper gagal diakses:\n- ${errors.join('\n- ')}`);
}

module.exports = { tiktokDl };