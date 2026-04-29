/**
 * Nama Plugin: eFootball Playstyle Database
 * Deskripsi: Menampilkan informasi detail gaya bermain pemain di efootball (Indonesia/Inggris)
 * Author: Senior Bot Developer
 * Lokasi: plugins/efootball-playstyle.js
 */

// Memanggil database dari folder lib
const dbPlaystyle = require('../lib/gaya_bermain');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Jika tidak ada parameter teks (hanya mengetik command) -> Tampilkan list
    if (!text) {
        let listMsg = `⚽ *DATABASE PLAYSTYLE eFOOTBALL* ⚽\n\n`;
        listMsg += `Ketik *${usedPrefix}${command} <nama>* untuk melihat detail.\n`;
        listMsg += `Contoh: *${usedPrefix}${command} Goal Poacher*\n\n`;
        listMsg += `*Daftar Playstyle:*\n`;
        
        dbPlaystyle.forEach(p => {
            listMsg += `- ${p.id} (${p.en})\n`;
        });
        
        listMsg += `\n_Anda bisa mencari menggunakan bahasa Indonesia atau Inggris._`;
        return m.reply(listMsg);
    }

    // Mengirim pesan loading (menggunakan variabel global wait)
    //await m.reply(global.wait || '_Sedang memproses..._');

    // 2. Logika Pencarian (Case Insensitive & Filter)
    let query = text.toLowerCase().trim();
    let matches = dbPlaystyle.filter(p => 
        (p.id || '').toLowerCase().includes(query) || 
        (p.en || '').toLowerCase().includes(query)
    );

    // Handle jika playstyle tidak ditemukan
    if (matches.length === 0) {
        return m.reply(`⚠️ Playstyle dengan kata kunci *"${text}"* tidak ditemukan dalam database.\nCoba gunakan kata kunci lain, misalnya: *Goal Poacher* atau *Target Man*.`);
    }

    // Handle jika ada BANYAK kecocokan
    if (matches.length > 1) {
        let list = `🔍 *Ditemukan ${matches.length} playstyle untuk "${text}":*\n\n`;
        matches.forEach((p, i) => {
            list += `- *${p.id}* (${p.en})\n`;
        });
        list += `\n_Ketik perintah lebih spesifik, contoh: ${usedPrefix + command} ${matches[0].id}_`;
        return m.reply(list);
    }

    // Format output data yang rapi (Emoji UX) untuk 1 kecocokan
    let result = matches[0];
    let detailMsg = `*⚽ DETAIL PLAYSTYLE PEMAIN*\n\n`;
    detailMsg += `🇮🇩 *Nama (ID):* ${result.id}\n`;
    detailMsg += `🇬🇧 *Nama (EN):* ${result.en}\n`;
    detailMsg += `👤 *Posisi Cocok:* ${result.pos}\n\n`;
    detailMsg += `📖 *Deskripsi:*\n${result.desc}`;

    // Meneruskan balasan ke user
    await m.reply(detailMsg);
}

// Metadata Plugin
handler.help = ['playstyle <nama>']
handler.tags = ['efootball']
handler.command = /^(playstyle|gayamain)$/i
handler.limit = true // Praktik keamanan UX (opsional, hapus jika digratiskan)

module.exports = handler;