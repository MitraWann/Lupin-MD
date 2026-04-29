/**
 * TULIPNEX EVENT CATALOG (Admin Tool)
 * Location: ./plugins/trading-listevent.js
 * Feature: Menampilkan seluruh daftar event yang ada di dalam database secara ringkas
 */

const path = require('path');
const fs = require('fs');

// Membaca file database event
const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

let handler = async (m, { conn, usedPrefix, command }) => {
    // Validasi apakah file event ada
    if (eventPool.length === 0) {
        return m.reply('[!] File ./lib/trading-events.js tidak ditemukan atau database kosong.');
    }

    let caption = `📜 *KATALOG EVENT TULIPNEX*\n`;
    caption += `──────────────────\n`;
    caption += `Total Database: *${eventPool.length} Event*\n\n`;

    // 1. Mengelompokkan event berdasarkan ticker (GLOBAL, IVL, LBT, dll)
    let grouped = {};
    for (let ev of eventPool) {
        let key = ev.ticker || 'GLOBAL';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ev);
    }

    // 2. Definisi Ikon Ticker agar lebih visual
    const icons = {
        GLOBAL: '🌍', 
        IVL: '🌱', 
        LBT: '🌼', 
        IRC: '👁️', 
        LTN: '🌐', 
        RSX: '🌹', 
        TNX: '🌷'
    };

    // 3. Menyusun output pesan
    for (let ticker in grouped) {
        let icon = icons[ticker] || '📦';
        let titleName = ticker === 'GLOBAL' ? 'GLOBAL (ALL MARKET)' : `TIER: ${ticker}`;
        
        caption += `${icon} *■ ${titleName}*\n`;

        grouped[ticker].forEach(ev => {
            // Indikator visual apakah event ini menaikkan (Bull) atau menurunkan (Bear) harga
            let trendEmoji = ev.type === 'bull' ? '📈' : '📉';
            caption += `  ${trendEmoji} ${ev.title} _(${ev.dur}m)_\n`;
        });
        caption += `\n`;
    }

    caption += `──────────────────\n`;
    caption += `💡 *Tips Eksekusi (God Mode):*\n`;
    caption += `Gunakan *${usedPrefix}setevent <Judul>* untuk memicu event tertentu secara paksa.\n`;
    caption += `Contoh: *${usedPrefix}setevent ALIEN TECH REVEAL*`;

    return m.reply(caption.trim());
}

handler.help = ['listevent', 'listevents'];
handler.tags = ['god'];
handler.command = /^(listevent|listevents|allevents|katalogevent)$/i;
handler.owner = true; // Keamanan Ekstra: Fitur ini MUTLAK hanya untuk Owner bot
handler.private = true; // Direkomendasikan dijalankan di PC/Japri agar tidak nyepam grup

module.exports = handler;