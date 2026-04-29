/**
 * Nama Plugin: YouTube Search (Standalone)
 * Deskripsi: Menangani pencarian video YouTube.
 * Author: Senior Bot Developer
 */

const { youtubeSearch } = require('../lib/ytsearch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input dari user
    if (!text) {
        let caption = `*🔍 PANDUAN PENCARIAN YOUTUBE*\n\n`;
        caption += `Ketik: *${usedPrefix}${command} <judul/query>*\n`;
        caption += `Contoh: *${usedPrefix}${command} Tutorial Node.js*`;
        return m.reply(caption);
    }

    // Memberikan indikator loading
    await m.reply(global.wait);

    try {
        // Memanggil fungsi scraper dari library lokal
        let search = await youtubeSearch(text);
        if (!search || !search.video || search.video.length === 0) throw 'Video tidak ditemukan.';

        let teks = `*🔎 HASIL PENCARIAN YOUTUBE*\n\n`;
        
        // Menampilkan maksimal 7 hasil agar pesan tidak terlalu panjang/spam
        for (let i = 0; i < Math.min(7, search.video.length); i++) {
            let v = search.video[i];
            teks += `*${i + 1}. ${v.title}*\n`;
            teks += `👤 *Channel:* ${v.authorName}\n`;
            teks += `⏱️ *Durasi:* ${v.durationH}\n`;
            teks += `👀 *Views:* ${v.viewH}\n`;
            teks += `🔗 *Link:* ${v.url}\n\n`;
        }
        
        teks += `_Silakan salin link di atas dan gunakan fitur downloader Anda untuk mengunduh._`;

        // Mengirimkan pesan menggunakan fungsi native Baileys agar teks caption tidak terpotong/hilang
        let firstThumb = search.video[0].thumbnail;
        await conn.sendMessage(m.chat, { 
            image: { url: firstThumb }, 
            caption: teks 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`${global.eror}\n\nTerjadi kesalahan! Gagal melakukan pencarian.`);
    }
}

// Metadata plugin
handler.help = ['yousearch'].map(v => v + ' <query>')
handler.tags = ['search']
handler.command = /^(yousearch|yts)$/i

handler.limit = true; // Membatasi penggunaan agar server tidak terbebani
handler.group = false; // Bisa digunakan di grup maupun private chat

module.exports = handler;