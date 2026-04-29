let fetch = require('node-fetch');
let cheerio = require('cheerio');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Validasi input
    if (!args[0]) throw `*Contoh:* ${usedPrefix}${command} https://videy.co/v?id=lRWu3Sw81`;
    
    if (!args[0].match(/^https?:\/\//i)) {
        throw `URL Tidak Valid! Pastikan link diawali dengan http:// atau https://`;
    }

    // Mengirim pesan indikator loading (dari global.wait)
    await m.reply(wait);

    try {
        // Fetch halaman HTML asli dari URL yang diberikan
        const response = await fetch(args[0], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const html = await response.text();

        // Load struktur HTML menggunakan library Cheerio
        const $ = cheerio.load(html);

        // Target: Mencari tag <source> yang secara spesifik memiliki type="video/mp4"
        let videoUrl = $('source[type="video/mp4"]').attr('src');

        // Fallback 1: Jika tidak ketemu, cari <source> apa saja yang berada di dalam tag <video>
        if (!videoUrl) {
            videoUrl = $('video source').attr('src');
        }

        // Fallback 2: Jika Cheerio tidak mendapatkan tagnya (misal karena lazy load/struktur berantakan), gunakan Regex murni
        if (!videoUrl) {
            let regexMatch = html.match(/<source\s+src="([^"]+)"\s*(?:type="video\/mp4")?/i);
            if (regexMatch && regexMatch[1]) {
                videoUrl = regexMatch[1];
            }
        }

        // Jika sampai sini tidak mendapatkan link, lemparkan error
        if (!videoUrl) throw `Video tidak ditemukan dalam source code web tersebut!`;

        // Memastikan URL Video menjadi absolute URL (Jika hasilnya relatif seperti "/video.mp4")
        if (!videoUrl.startsWith('http')) {
            const { URL } = require('url');
            videoUrl = new URL(videoUrl, args[0]).href;
        }

        // Mengirimkan Video ke Pengguna
        await conn.sendFile(m.chat, videoUrl, 'video.mp4', `🎥 *VIDEO DOWNLOADER*\n\n🔗 *Source:* ${args[0]}\n*✅ Berhasil diunduh!*`, m);

    } catch (e) {
        console.error(e);
        // Menampilkan pesan error global bawaan bot jika proses gagal
        m.reply(typeof e === 'string' ? e : eror);
    }
}

handler.help = ['webvid'].map(v => v + ' <url>');
handler.tags = ['downloader'];
// Regex command mendeteksi prefix + videy / videydl / mp4dl
handler.command = /^(any|mp4dl|webvid)$/i; 
handler.limit = true; // Dipasang handler.limit agar tidak disalahgunakan spammer

module.exports = handler;