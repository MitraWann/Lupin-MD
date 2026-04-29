/**
 * TULIPNEX MARKET RESET TOOL (Admin Only)
 * Location: ./plugins/trading-reset.js
 * Description: Reset harga, ATH, atau riwayat secara spesifik per ticker atau keseluruhan.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Definisi Harga Awal (Sesuai Konfigurasi Core)
    const marketConfig = {
        IVL: { name: 'IvyLink', min: 3000 },
        LBT: { name: 'LilyBit', min: 100000 },
        IRC: { name: 'IrisCode', min: 1000000 },
        LTN: { name: 'LotusNet', min: 10000000 },
        RSX: { name: 'RoseX', min: 100000000 },
        TNX: { name: 'TulipNex', min: 1000000000 }
    };

    // 2. Akses Database
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) {
        return m.reply('[!] Sistem TulipNex belum aktif.');
    }

    let market = global.db.data.settings.trading;

    // 3. Panduan Penggunaan (Buku Manual)
    if (args.length < 2) {
        let guide = `⚙️ *TULIPNEX RESET MANAGER*\n`;
        guide += `──────────────────\n`;
        guide += `Gunakan perintah ini untuk mereset data pasar secara spesifik.\n\n`;
        guide += `*Format:* ${usedPrefix}${command} <Ticker/ALL> <Data/ALL>\n\n`;
        guide += `*Pilihan Target (Ticker):*\n`;
        guide += `• Ticker valid (IVL, LBT, IRC, LTN, RSX, TNX)\n`;
        guide += `• *ALL* (Pilih semua aset)\n\n`;
        guide += `*Pilihan Kategori (Data):*\n`;
        guide += `• *price* (Kembalikan harga ke nilai dasar)\n`;
        guide += `• *ath* (Hapus rekor All-Time High)\n`;
        guide += `• *history* (Hapus riwayat pergerakan grafik)\n`;
        guide += `• *event* (Hentikan event/berita yang sedang berjalan)\n`;
        guide += `• *all* (Reset seluruh data untuk target tersebut)\n\n`;
        guide += `*Contoh Penggunaan:*\n`;
        guide += `1. ${usedPrefix}${command} TNX ath _(Reset rekor ATH milik TNX saja)_\n`;
        guide += `2. ${usedPrefix}${command} ALL history _(Bersihkan grafik semua koin)_\n`;
        guide += `3. ${usedPrefix}${command} ALL ALL _(WIPE OUT: Reset total keseluruhan)_`;
        return m.reply(guide);
    }

    let targetTicker = args[0].toUpperCase();
    let targetData = args[1].toLowerCase();

    // 4. Validasi Argumen
    let validTickers = Object.keys(marketConfig);
    if (targetTicker !== 'ALL' && !validTickers.includes(targetTicker)) {
        return m.reply(`[!] Ticker *${targetTicker}* tidak dikenali.`);
    }

    let validData = ['price', 'ath', 'history', 'event', 'all'];
    if (!validData.includes(targetData)) {
        return m.reply(`[!] Kategori data *${targetData}* tidak valid. (Pilih: price/ath/history/event/all)`);
    }

    // Tentukan aset mana saja yang akan dieksekusi
    let tickersToReset = targetTicker === 'ALL' ? validTickers : [targetTicker];

    // 5. Eksekusi Reset
    
    // Reset Event (Global)
    if (targetData === 'event' || targetData === 'all') {
        market.activeEvent = { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
    }

    for (let t of tickersToReset) {
        let minPrice = marketConfig[t].min;

        if (targetData === 'price' || targetData === 'all') {
            market.prices[t] = minPrice;
            market.prevPrices[t] = minPrice;
            market.history[t] = [minPrice]; // History juga harus direset jika harga direset
            market.momentum[t] = 0;
            market.trends[t] = { type: 'flat', dur: Math.floor(Math.random() * 11) + 5 };
            if (targetData === 'price') market.ath[t] = minPrice; // Reset ATH otomatis ke min
        }

        if (targetData === 'ath' || targetData === 'all') {
            // Jika reset ATH saja, kembalikan ke harga SAAT INI (bukan harga dasar)
            market.ath[t] = market.prices[t];
        }

        if (targetData === 'history') {
            // Jika reset history saja, hapus jejak masa lalu, tinggalkan harga saat ini
            market.history[t] = [market.prices[t]];
        }
    }

    market.lastUpdate = Date.now();

    // 6. Laporan Keberhasilan
    let res = `🏛️ *TULIPNEX RESET EXECUTED*\n`;
    res += `──────────────────\n`;
    res += `🎯 Target Aset : *${targetTicker}*\n`;
    res += `🗑️ Data Dihapus : *${targetData.toUpperCase()}*\n`;
    res += `──────────────────\n`;
    res += `_Operasi sistem berhasil. Data telah diperbarui di database._`;

    return m.reply(res);
}

handler.help = ['resetmarket <ticker> <data>']
handler.tags = ['god']
handler.command = /^(resetmarket|marketreset)$/i
handler.owner = true;
handler.private = true;

module.exports = handler;