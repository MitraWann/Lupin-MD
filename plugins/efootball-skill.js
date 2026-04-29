/**
 * Nama Plugin: eFootball Skill Database
 * Deskripsi: Menampilkan informasi keahlian pemain berdasarkan input user.
 * Terintegrasi dengan: ../lib/keahlian_pemain.js
 */

const keahlianPemain = require('../lib/keahlian_pemain');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi input kosong
    if (!text) {
        let usage = `*Contoh Penggunaan:*\n`;
        usage += `- ${usedPrefix + command} Umpan Terobosan\n`;
        usage += `- ${usedPrefix + command} Double Touch\n\n`;
        usage += `_Gunakan kata kunci bahasa Indonesia atau Inggris._`;
        return m.reply(usage);
    }
    
    // Mengirim pesan loading (opsional, nonaktifkan jika dirasa spam)
    // await m.reply(global.wait || '_Sedang memproses..._');
    
    // 2. Pencarian dengan filter: Mengambil SEMUA kecocokan (Case Insensitive & Safe Check)
    let query = text.toLowerCase().trim();
    let matches = keahlianPemain.filter(v => 
        (v.name || '').toLowerCase().includes(query) || 
        (v.name_en || '').toLowerCase().includes(query)
    );
    
    // 3. Handle jika keahlian tidak ditemukan
    if (matches.length === 0) {
        return m.reply(`⚠️ Keahlian dengan kata kunci *"${text}"* tidak ditemukan dalam database.\nCoba gunakan kata kunci lain, misalnya: *Flip Flap* atau *Benteng*.`);
    }

    // 4. Handle jika ada BANYAK kecocokan
    if (matches.length > 1) {
        let list = `🔍 *Ditemukan ${matches.length} keahlian untuk "${text}":*\n\n`;
        matches.forEach((v, i) => {
            list += `- *${v.name}* (${v.name_en})\n`;
        });
        list += `\n_Ketik perintah lebih spesifik, contoh: ${usedPrefix + command} ${matches[0].name}_`;
        return m.reply(list);
    }
    
    // 5. Format output data yang rapi (Emoji UX) untuk 1 kecocokan
    let result = matches[0];
    let detailMsg = `*⚽ DETAIL KEAHLIAN*\n\n`;
    detailMsg += `🇮🇩 *Nama (ID):* ${result.name}\n`;
    detailMsg += `🇬🇧 *Nama (EN):* ${result.name_en}\n`;
    detailMsg += `📂 *Kategori:* ${result.category}\n\n`;
    detailMsg += `📖 *Deskripsi:*\n${result.description}`;
    
    // Kirim balasan
    await m.reply(detailMsg);
};

// Metadata plugin
handler.help = ['skill <nama>'];
handler.tags = ['efootball'];
handler.command = /^(skill|skillinfo|keahlian)$/i;
handler.limit = true; // Praktik keamanan UX (opsional, hapus jika digratiskan)

module.exports = handler;