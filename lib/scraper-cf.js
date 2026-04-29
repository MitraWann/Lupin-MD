// Nama File: lib/scraper-cf.js
// Fungsi: HTTP Client dengan Auto-Fallback Bypass Cloudflare

const axios = require('axios');
const { shannz: cf } = require('bycf');

/**
 * Mengambil data dari URL dengan fitur auto-bypass jika terdeteksi Cloudflare.
 * * @param {string} url - Tautan target yang akan diambil datanya.
 * @param {object} options - (Opsional) Konfigurasi tambahan untuk Axios.
 * @returns {Promise<{data: any, headers: object}>} Mengembalikan objek berisi { data, headers }.
 */
async function fetchBypass(url, options = {}) {
    // Konfigurasi standar untuk menyamar sebagai browser desktop
    const defaultOptions = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Referer": url,
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        },
        responseType: 'arraybuffer', // Aman untuk mengunduh media/dokumen
        ...options // Timpa dengan opsi kustom jika ada
    };

    try {
        // 1. Mencoba jalur normal (Axios) yang lebih cepat
        const response = await axios.get(url, defaultOptions);
        
        return {
            data: response.data,
            headers: response.headers || {}
        };
        
    } catch (error) {
        // 2. Jika web menolak karena proteksi keamanan (Cloudflare biasanya 403 atau 503)
        if (error.response && (error.response.status === 403 || error.response.status === 503)) {
            try {
                // Alihkan ke jalur bypass (bycf)
                const cfResponse = await cf.source(url);
                
                // Normalisasi output bycf agar strukturnya konsisten dengan output Axios
                const isJson = typeof cfResponse === 'string' && cfResponse.trim().startsWith('{');
                
                return {
                    data: cfResponse,
                    headers: {
                        'content-type': isJson ? 'application/json' : 'text/html',
                        'content-length': cfResponse ? Buffer.byteLength(String(cfResponse)) : 0
                    }
                };
            } catch (cfError) {
                // Gagal di jalur bypass
                throw new Error(`Auto-Bypass Gagal: ${cfError.message}`);
            }
        } else {
            // Lempar error murni jika bukan karena Cloudflare (misal: 404 Not Found, Timeout)
            throw error;
        }
    }
}

module.exports = fetchBypass;