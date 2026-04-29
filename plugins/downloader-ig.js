const axios = require('axios');
const { scrapeInstagram } = require('../lib/snapinsta');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) {
        return m.reply(`Masukkan URL Instagram!\n\n*Contoh:* ${usedPrefix + command} https://www.instagram.com/p/C_abc123/`);
    }
    if (!text.match(/(https:\/\/(www\.)?instagram\.com\/(p|reel|tv|stories)\/.*)/i)) {
        return m.reply('❌ URL Instagram tidak valid!');
    }

    // 2. Tampilkan pesan loading
    m.reply(global.wait);

    let isSuccess = false;
    let mediaUrls = [];
    let cap = `*I N S T A G R A M*\n\n`;

    // =======================================================
    // SERVER 1 (PRIMARY): API FAA (Mengambil Metadata)
    // =======================================================
    try {
        let apiUrl = `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(text)}`;
        let { data } = await axios.get(apiUrl);

        if (!data.status) throw 'Gagal mengambil data dari API Primary.';
        
        let result = data.result;
        if (!result || !result.url || result.url.length === 0) throw 'Media tidak ditemukan atau akun di-private.';

        mediaUrls = result.url;
        let meta = result.metadata || {};

        // Membuat caption kaya metadata
        if (meta.username) cap += `◦ *Username:* ${meta.username}\n`;
        if (meta.like) cap += `◦ *Likes:* ${meta.like}\n`;
        if (meta.comment) cap += `◦ *Comments:* ${meta.comment}\n`;
        if (meta.caption) cap += `◦ *Caption:* \n> ${meta.caption}\n\n`;
        
        cap += `\n\n${global.wm || '© Bot WhatsApp'}`;
        isSuccess = true;
    } catch (e) {
        console.log('[API FAA Error] Mencoba server fallback Snapinsta...', e.message);
    }

    // =======================================================
    // SERVER 2 (FALLBACK): SNAPINSTA SCRAPER
    // =======================================================
    if (!isSuccess) {
        try {
            const snapResult = await scrapeInstagram(text);
            
            if (snapResult && (snapResult.videos.length > 0 || snapResult.images.length > 0)) {
                let isReelOrTV = text.match(/\/(reel|tv)\//i);
                let isOnlyVideos = (snapResult.videos.length > 0 && snapResult.videos.length === snapResult.images.length);

                if (!(isReelOrTV || isOnlyVideos)) {
                    mediaUrls.push(...snapResult.images);
                }
                mediaUrls.push(...snapResult.videos);

                cap += `\n\n${global.wm || '© Bot WhatsApp'}`;
                isSuccess = true;
            } else {
                throw 'Media kosong.';
            }
        } catch (err) {
            console.error('[Error IG Downloader Fallback]:', err);
            return m.reply(`${global.eror}\n\nGagal mengunduh media. Pastikan URL valid dan akun Instagram tidak di-private.`);
        }
    }

    // =======================================================
    // EKSEKUSI PENGIRIMAN MEDIA (SINGLE CAPTION DELIVERY)
    // =======================================================
    if (isSuccess && mediaUrls.length > 0) {
        for (let i = 0; i < mediaUrls.length; i++) {
            let url = mediaUrls[i];
            
            // Kirim caption HANYA di media pertama agar chat tidak dispam (dari downloader-ig.js)
            let sendCaption = i === 0 ? cap : '';
            
            // Eksekusi pengiriman file
            await conn.sendFile(m.chat, url, 'igmedia', sendCaption, m);
        }
    } else {
        return m.reply('❌ Tidak ada media yang berhasil diekstrak untuk dikirim.');
    }
}

handler.help = ['instagram', 'snap', 'ig'].map(v => v + ' <url>');
handler.tags = ['downloader'];
// Menyatukan semua command trigger menjadi satu Regex
handler.command = /^(instagram|ig|igdl)$/i;

// Flag Fungsional / Keamanan
handler.limit = true; // Mengurangi limit (sesuai config global di handler.js)
handler.group = false; 

module.exports = handler;