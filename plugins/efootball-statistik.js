/**
 * Nama Plugin: eFootball Statistik Database
 * Deskripsi: Menampilkan informasi detail atribut/statistik pemain di eFootball (Indonesia/Inggris)
 * Author: Senior Bot Developer
 * Lokasi: plugins/efootball-statistik.js
 */

// Memanggil database dari folder lib
const dbStatistik = require('../lib/statistik_efootball');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Jika tidak ada parameter teks (hanya mengetik command) -> Tampilkan list berkategori
    if (!text) {
        let listMsg = `📊 *DATABASE STATISTIK eFOOTBALL* 📊\n\n`;
        listMsg += `Ketik *${usedPrefix}${command} <nama statistik>* untuk melihat detail.\n`;
        listMsg += `Contoh: *${usedPrefix}${command} Kicking Power*\n\n`;
        
        // Membagi list berdasarkan kategori
        const categories = [...new Set(dbStatistik.map(item => item.cat))];
        
        categories.forEach(cat => {
            listMsg += `*${cat.toUpperCase()}*\n`;
            let items = dbStatistik.filter(p => p.cat === cat);
            items.forEach(p => {
                listMsg += `- ${p.id} (${p.en})\n`;
            });
            listMsg += `\n`;
        });
        
        listMsg += `_Anda bisa mencari menggunakan bahasa Indonesia atau Inggris._`;
        return m.reply(listMsg);
    }

    // Mengirim pesan loading (bisa diaktifkan jika perlu)
    // await m.reply(global.wait || '_Sedang memproses..._');

    // 2. Logika Pencarian (Case Insensitive & Filter)
    let query = text.toLowerCase().trim();
    let matches = dbStatistik.filter(p => 
        (p.id || '').toLowerCase().includes(query) || 
        (p.en || '').toLowerCase().includes(query)
    );

    // 3. Handle jika statistik tidak ditemukan
    if (matches.length === 0) {
        return m.reply(`⚠️ Atribut dengan kata kunci *"${text}"* tidak ditemukan dalam database.\nCoba gunakan kata kunci lain, misalnya: *Speed* atau *Kesadaran*.`);
    }

    // 4. Handle jika ada BANYAK kecocokan
    if (matches.length > 1) {
        let list = `🔍 *Ditemukan ${matches.length} statistik untuk "${text}":*\n\n`;
        matches.forEach((p, i) => {
            list += `- *${p.id}* (${p.en})\n`;
        });
        list += `\n_Ketik perintah lebih spesifik, contoh: ${usedPrefix + command} ${matches[0].id}_`;
        return m.reply(list);
    }

    // 5. Format output data yang rapi (Emoji UX) untuk 1 kecocokan
    let result = matches[0];
    let detailMsg = `*📈 DETAIL STATISTIK PEMAIN*\n\n`;
    detailMsg += `🇮🇩 *Nama (ID):* ${result.id}\n`;
    detailMsg += `🇬🇧 *Nama (EN):* ${result.en}\n`;
    detailMsg += `📂 *Kategori:* ${result.cat}\n\n`;
    detailMsg += `📖 *Fungsi & Deskripsi:*\n${result.desc}`;

    // Meneruskan balasan ke user
    await m.reply(detailMsg);
}

// Metadata Plugin
handler.help = ['statistik <nama>', 'stats <nama>']
handler.tags = ['efootball']
handler.command = /^(statistik|stats|statistikefootball)$/i
handler.limit = true // Praktik keamanan UX (opsional, hapus jika digratiskan)

module.exports = handler;