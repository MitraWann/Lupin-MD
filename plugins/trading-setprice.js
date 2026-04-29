/**
 * TULIPNEX MARKET MANIPULATOR (Admin Tool)
 * Location: ./plugins/trading-setprice.js
 * Description: Memungkinkan Owner untuk mengatur harga ticker dengan batasan Floor & Ceiling.
 * - [UPDATE]: Mengubah limit shift array history ke 10.
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // 1. Konfigurasi Batas Harga (Floor & Ceiling)
    const marketConfig = {
        IVL: { name: 'IvyLink', min: 3000, max: 99999 },
        LBT: { name: 'LilyBit', min: 100000, max: 999999 },
        IRC: { name: 'IrisCode', min: 1000000, max: 9999999 },
        LTN: { name: 'LotusNet', min: 10000000, max: 99999999 },
        RSX: { name: 'RoseX', min: 100000000, max: 999999999 },
        TNX: { name: 'TulipNex', min: 1000000000, max: 10000000000 }
    };

    // 2. Validasi Keaktifan Database Trading
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading || !global.db.data.settings.trading.prices) {
        return m.reply('[!] Sistem TulipNex belum aktif. Biarkan Engine berjalan terlebih dahulu.');
    }

    let market = global.db.data.settings.trading;

    // 3. Validasi Argumen Input
    if (args.length < 2) {
        let guide = `⚙️ *MARKET MANIPULATOR GUIDE*\n`;
        guide += `──────────────────\n`;
        guide += `Gunakan perintah ini untuk meretas harga pasar secara instan.\n\n`;
        guide += `*Format:* ${usedPrefix}${command} <Ticker> <Harga>\n`;
        guide += `*Contoh:* ${usedPrefix}${command} TNX 5000000000`;
        return m.reply(guide);
    }

    let ticker = args[0].toUpperCase();
    let newPrice = parseInt(args[1]);

    // 4. Validasi Ticker dan Angka
    if (!marketConfig[ticker] || market.prices[ticker] === undefined) {
        return m.reply(`[!] Ticker *${ticker}* tidak ditemukan di bursa TulipNex.`);
    }

    if (isNaN(newPrice) || newPrice <= 0) {
        return m.reply(`[!] Harga baru harus berupa angka positif yang valid.`);
    }

    // 5. FILTER MUTLAK: Validasi Min & Max
    let minPrice = marketConfig[ticker].min;
    let maxPrice = marketConfig[ticker].max;

    if (newPrice < minPrice || newPrice > maxPrice) {
        let warnMsg = `❌ *MANIPULASI GAGAL (OUT OF BOUNDS)*\n`;
        warnMsg += `Harga yang Anda masukkan melanggar batas fundamental aset!\n\n`;
        warnMsg += `🏷️ Ticker: *${ticker}*\n`;
        warnMsg += `📉 Batas Bawah: *Rp ${minPrice.toLocaleString()}*\n`;
        warnMsg += `📈 Batas Atas: *Rp ${maxPrice.toLocaleString()}*\n\n`;
        warnMsg += `_Silakan masukkan angka di dalam rentang tersebut._`;
        return m.reply(warnMsg);
    }

    // 6. Eksekusi Intervensi Pasar
    let oldPrice = market.prices[ticker];
    market.prices[ticker] = newPrice;
    
    // Perbarui riwayat agar grafik indikator tidak error
    if (!market.history[ticker]) market.history[ticker] = [];
    market.history[ticker].push(newPrice);
    
    // SEBELUMNYA > 5, SEKARANG DIUBAH MENJADI > 10
    if (market.history[ticker].length > 10) market.history[ticker].shift();

    // Perbarui ATH (All-Time High) jika manipulasi menembus rekor
    if (newPrice > (market.ath[ticker] || 0)) market.ath[ticker] = newPrice;

    // Netralkan momentum agar algoritma core tidak langsung "panik" melakukan koreksi
    market.momentum[ticker] = 0;

    // 7. Laporan Sukses
    let res = `⚠️ *MARKET INTERVENTION SUCCESS*\n`;
    res += `──────────────────\n`;
    res += `📦 Ticker: *${ticker}*\n`;
    res += `📉 Harga Lama: Rp ${oldPrice.toLocaleString()}\n`;
    res += `📈 Harga Baru: Rp ${newPrice.toLocaleString()}\n`;
    res += `──────────────────\n`;
    res += `_Akses Root dikonfirmasi. Harga telah dimanipulasi ke dalam database._`;

    return m.reply(res);
}

handler.help = ['setprice <ticker> <harga>']
handler.tags = ['god']
handler.command = /^(setprice|setharga|injectprice)$/i
handler.owner = true; 
handler.private = true;

module.exports = handler;