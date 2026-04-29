/**
 * Nama Plugin: Lyricsify Scraper Interactive
 * Deskripsi: Mencari lagu dengan sistem List & Pagination, lalu ekstrak LRC.
 * Dependency: cheerio, ../lib/scraper-cf.js
 */

const cheerio = require('cheerio');
const fetchBypass = require('../lib/scraper-cf.js');

// Fungsi pembantu untuk memproses pencarian dan scraping list
async function searchLyrics(query, botPage = 1) {
    // Kalkulasi: 1 Halaman Web = 20 item = 2 Halaman Bot (10 item/hal)
    let webPage = Math.ceil(botPage / 2);
    let searchUrl = `https://www.lyricsify.com/search?q=${encodeURIComponent(query)}&page=${webPage}`;
    let res = await fetchBypass(searchUrl);
    let $ = cheerio.load(res.data);
    
    let allResults = [];
    $('.li').each((i, el) => {
        let titleEl = $(el).find('a.title.font-bold');
        let titleText = titleEl.text().trim();
        let linkPath = titleEl.attr('href');
        
        if (titleText && linkPath) {
            allResults.push({ 
                title: titleText, 
                link: 'https://www.lyricsify.com' + linkPath 
            });
        }
    });
    
    // Logika Pemotongan Halaman di Bot (10 per halaman)
    // Jika botPage ganjil (1, 3, 5), ambil index 0-9. Jika genap (2, 4, 6), ambil 10-19.
    let startIndex = (botPage % 2 === 1) ? 0 : 10;
    let endIndex = startIndex + 10;
    
    return allResults.slice(startIndex, endIndex);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Memastikan objek session tersedia
    conn.lyricsify = conn.lyricsify || {};

    if (!text) {
        throw `*Contoh Penggunaan:*\n${usedPrefix}${command} about you`;
    }

    await m.reply(global.wait || '⏳ _Sedang mencari, mohon tunggu..._');

    try {
        // ==========================================
        // PENCARIAN (Menampilkan List)
        // ==========================================
        let results = await searchLyrics(text, 1);
        if (results.length === 0) throw `Lagu "${text}" tidak ditemukan!`;

        let caption = `🔎 *Hasil Pencarian: ${text}*\n_Halaman: 1_\n\n`;
        results.forEach((v, i) => {
            caption += `${i + 1}. ${v.title}\n`;
        });
        caption += `\n──────────────────\n`;
        caption += `> *Reply dengan angka* (1-${results.length}) untuk melihat lirik.\n`;
        caption += `> *Reply 'next'* untuk halaman selanjutnya.`;

        let sentMsg = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });

        // Menyimpan Session Interaktif User
        conn.lyricsify[m.sender] = {
            query: text,
            page: 1,
            results: results,
            msgId: sentMsg.key.id,
            timeout: setTimeout(() => {
                if (conn.lyricsify[m.sender]) delete conn.lyricsify[m.sender];
            }, 300000) // Sesi hangus dalam 5 menit (300.000 ms)
        };

    } catch (error) {
        console.error(error);
        m.reply(`${global.eror || '❌'} *Error:*\n${error.message || error}`);
    }
}

// ==========================================
// LISTENER BALASAN (INTERACTIVE SESSION)
// ==========================================
handler.before = async (m, { conn }) => {
    conn.lyricsify = conn.lyricsify || {};
    let session = conn.lyricsify[m.sender];
    
    // Validasi: Apakah sesi ada, user mengirim teks, dan membalas pesan bot?
    if (!session || !m.text || !m.quoted) return;
    if (m.quoted.id !== session.msgId) return;

    let txt = m.text.trim().toLowerCase();

    try {
        // --- LOGIC PAGINATION (NEXT/PREV) ---
        if (txt === 'next' || txt === 'prev') {
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            
            let newPage = txt === 'next' ? session.page + 1 : session.page - 1;
            if (newPage < 1) newPage = 1;

            let newResults = await searchLyrics(session.query, newPage);
            if (newResults.length === 0) {
                return m.reply(`Mentok! Tidak ada hasil lagi di halaman ${newPage}.`);
            }

            // Update sesi dengan data baru
            clearTimeout(session.timeout);
            session.page = newPage;
            session.results = newResults;
            session.timeout = setTimeout(() => { delete conn.lyricsify[m.sender]; }, 300000);

            let caption = `🔎 *Hasil Pencarian: ${session.query}*\n_Halaman: ${session.page}_\n\n`;
            newResults.forEach((v, i) => {
                caption += `${i + 1}. ${v.title}\n`;
            });
            caption += `\n──────────────────\n`;
            caption += `> *Reply dengan angka* (1-${newResults.length}) untuk melihat lirik.\n`;
            caption += `> *Reply '${session.page > 1 ? 'prev / ' : ''}next'* untuk navigasi.`;

            let sentMsg = await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
            session.msgId = sentMsg.key.id; // Update target balasan
            return;
        }

        // --- LOGIC SELEKSI ANGKA ---
        if (!isNaN(txt)) {
            let index = parseInt(txt) - 1;
            if (index < 0 || index >= session.results.length) {
                return m.reply(`⚠️ Pilihan tidak valid. Masukkan angka 1 sampai ${session.results.length}.`);
            }

            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            
            let target = session.results[index];
            
            // Hapus sesi setelah user memilih (Mencegah spam)
            clearTimeout(session.timeout);
            delete conn.lyricsify[m.sender];

            // Ekstrak lirik
            let resLyrics = await fetchBypass(target.link);
            let $$ = cheerio.load(resLyrics.data);
            let lyricContainer = $$('div[id^="lyrics_"][id$="_details"]');
            
            if (lyricContainer.length === 0) throw 'Lirik tidak ditemukan di halaman tersebut.';

            lyricContainer.find('br').replaceWith('\n');
            let lyricsText = lyricContainer.text().trim();
            lyricsText = lyricsText.replace(/\n\s*\n/g, '\n');
            
            let caption = `🎵 *LYRICSIFY ENGINE* 🎵\n\n`;
            caption += `*Title:* ${target.title}\n`;
            caption += `*Link:* ${target.link}\n`;
            caption += `──────────────────\n\n`;
            caption += `${lyricsText}`;

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
        }
    } catch (e) {
        console.error(e);
        m.reply(`❌ *Terjadi Kesalahan saat mengekstrak data:* ${e.message || e}`);
    }
}

handler.help = ['lyricsify'].map(v => v + ' <judul>');
handler.tags = ['internet'];
handler.command = /^(lyricsify)$/i;
handler.limit = true;

module.exports = handler;