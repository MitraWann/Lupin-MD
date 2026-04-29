/**
 * Plugin: Twitter/X Downloader
 * Description: Mengunduh video/gambar dari Twitter atau X menggunakan API publik NexRay.
 * Developer: Senior WhatsApp Bot Developer
 */

let fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Validasi Input Parameter
    if (!args[0]) {
        throw `*Contoh Penggunaan:*\n${usedPrefix}${command} https://x.com/i/status/2040653648091337190`;
    }
    
    // Validasi URL (Hanya menerima x.com atau twitter.com)
    if (!args[0].match(/(twitter\.com|x\.com)/gi)) {
        throw `⚠️ URL Tidak Valid! Pastikan Anda memasukkan link dari Twitter atau X.`;
    }

    // 2. Beri respon "waiting" menggunakan variabel global pengguna
    await m.reply(global.wait || '⏳ Sedang memproses tautan...');

    try {
        // 3. Hit API endpoint eksternal yang diminta (NexRay)
        let apiUrl = `https://api.nexray.web.id/downloader/twitter?url=${encodeURIComponent(args[0])}`;
        let response = await fetch(apiUrl);
        let json = await response.json();

        // 4. Validasi respon API
        if (!json.status || !json.result) {
            throw global.eror || `Terjadi kesalahan dari sisi server Downloader.`;
        }

        let { title, duration, type, download_url } = json.result;

        // 5. Mencari format media (memprioritaskan MP4 tertinggi/yang pertama kali muncul)
        let mediaUrl = '';
        let mediaType = '';

        let videoData = download_url.find(v => v.type === 'mp4');
        let imageData = download_url.find(v => v.type === 'image');

        if (videoData) {
            mediaUrl = videoData.url;
            mediaType = 'video';
        } else if (imageData) {
            mediaUrl = imageData.url;
            mediaType = 'image';
        }

        // Handle error jika media tidak ditemukan dalam array
        if (!mediaUrl) throw `⚠️ Media (Video/Gambar) tidak ditemukan pada tautan tersebut.`;

        // 6. Merapikan string untuk Caption
        let caption = `*X DOWNLOADER*`;

        // 7. Eksekusi pengiriman file menggunakan conn.sendFile
        if (mediaType === 'video') {
            await conn.sendFile(m.chat, mediaUrl, 'twitter.mp4', caption, m);
        } else {
            await conn.sendFile(m.chat, mediaUrl, 'twitter.jpg', caption, m);
        }

    } catch (e) {
        console.error('Error in Twitter Downloader:', e);
        // Fallback error menggunakan global.eror pengguna
        throw typeof e === 'string' ? e : (global.eror || '❌ Terjadi kesalahan saat mencoba mengunduh media.');
    }
}

// Metadata handler agar terdeteksi oleh sistem index
handler.help = ['twitter'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(twitter|x|xdl)$/i;
handler.limit = true; // Menggunakan sistem limitasi ekonomi agar balance

module.exports = handler;