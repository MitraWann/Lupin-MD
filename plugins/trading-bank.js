/**
 * TULIPNEX CENTRAL BANK (COLLATERAL LOAN)
 * Location: ./plugins/trading-bank.js
 * Feature: Pinjam uang dengan menggadaikan aset (With Auto-Guide & Auto-Liquidation)
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    user.bankLoan = user.bankLoan || null; 

    // Ambil harga live dari core
    let currentPrices = {};
    if (global.db.data.settings && global.db.data.settings.trading) {
        currentPrices = global.db.data.settings.trading.prices || {};
    }

    const marketConfig = {
        IVL: { db: 'ivylink' }, LBT: { db: 'lilybit' }, IRC: { db: 'iriscode' },
        LTN: { db: 'lotusnet' }, RSX: { db: 'rosex' }, TNX: { db: 'tulipnex' }
    };

    let action = command.toLowerCase();

    // ===================================
    // COMMAND: .gadai / .pinjam
    // ===================================
    if (action === 'gadai' || action === 'pinjam') {
        // Panduan otomatis jika format salah
        if (args.length < 2) {
            let guide = `🏦 *FASILITAS GADAI ASSET*\n──────────────────\n`;
            guide += `Dapatkan pinjaman tunai instan sebesar 50% dari harga pasar dengan jaminan aset Anda.\n\n`;
            guide += `*Format:* ${usedPrefix}${command} <ticker> <jumlah>\n`;
            guide += `*Contoh:* ${usedPrefix}${command} TNX 5\n\n`;
            guide += `*Ketentuan:*\n`;
            guide += `• Bunga Tetap: 15%\n`;
            guide += `• Tenor: 3 Hari (72 Jam)\n`;
            guide += `• Gagal bayar = Aset disita permanen.`;
            return m.reply(guide);
        }

        if (user.bankLoan) return m.reply(`[!] Anda masih memiliki pinjaman aktif!\nKetik *${usedPrefix}tebus* untuk melunasi utang lama terlebih dahulu.`);

        let ticker = args[0].toUpperCase();
        let qty = parseInt(args[1]);

        if (!marketConfig[ticker]) return m.reply(`[!] Ticker tidak valid. Daftar: IVL, LBT, IRC, LTN, RSX, TNX`);
        if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah tidak valid.\nContoh: *${usedPrefix}${command} TNX 5*`);

        let itemDb = marketConfig[ticker].db;
        if ((user[itemDb] || 0) < qty) return m.reply(`[!] Aset tidak cukup untuk digadaikan.`);

        let assetPrice = currentPrices[ticker] || 0;
        if (assetPrice === 0) return m.reply('[!] Bank sedang tutup / Harga pasar tidak tersedia.');

        // Kalkulasi Pinjaman
        let loanAmount = Math.floor((assetPrice * qty) * 0.50);
        let interest = Math.floor(loanAmount * 0.15); 
        let totalRepay = loanAmount + interest;

        // Eksekusi
        user[itemDb] -= qty;
        user.money += loanAmount;

        user.bankLoan = {
            ticker: ticker,
            qty: qty,
            debt: totalRepay,
            dueDate: Date.now() + (3 * 24 * 3600000) 
        };

        let msg = `🏦 *KONTRAK GADAI DISYAHKAN*\n──────────────────\n`;
        msg += `Aset Jaminan: *${qty.toLocaleString()} ${ticker}*\n`;
        msg += `Pinjaman Diterima: *Rp ${loanAmount.toLocaleString()}*\n`;
        msg += `Total Tagihan: *Rp ${totalRepay.toLocaleString()}*\n`;
        msg += `──────────────────\n`;
        msg += `⚠️ Jatuh tempo: 3 hari dari sekarang.\n`;
        msg += `Gunakan *${usedPrefix}utang* untuk mengecek sisa waktu.`;

        return m.reply(msg);
    }

    // ===================================
    // COMMAND: .bayar / .tebus
    // ===================================
    if (action === 'bayar' || action === 'tebus') {
        if (!user.bankLoan) return m.reply(`[!] Anda tidak memiliki utang untuk dilunasi.`);

        let loan = user.bankLoan;
        let itemDb = marketConfig[loan.ticker].db;

        // Cek Likuidasi
        if (Date.now() > loan.dueDate) {
            user.bankLoan = null; 
            return m.reply(`🚨 *LIKUIDASI OTOMATIS*\nWaktu pinjaman Anda telah habis. Aset *${loan.qty.toLocaleString()} ${loan.ticker}* resmi disita oleh Bank Sentral.`);
        }

        if (user.money < loan.debt) return m.reply(`[!] Saldo kurang! Anda butuh *Rp ${loan.debt.toLocaleString()}* untuk menebus aset.`);

        // Eksekusi Pelunasan
        user.money -= loan.debt;
        user[itemDb] += loan.qty; 
        user.bankLoan = null;

        return m.reply(`🏦 ✅ *LUNAS*\nAset *${loan.qty.toLocaleString()} ${loan.ticker}* telah dikembalikan ke dompet Anda.`);
    }

    // ===================================
    // COMMAND: .utang / .liabilitas
    // ===================================
    if (action === 'liabilitas' || action === 'utang') {
        if (!user.bankLoan) return m.reply(`🏦 Status: *Bebas Utang*. Anda tidak memiliki pinjaman aktif.`);

        let loan = user.bankLoan;
        
        // Cek Likuidasi saat intip utang
        if (Date.now() > loan.dueDate) {
            user.bankLoan = null;
            return m.reply(`🚨 *STATUS: DISITA*\nPinjaman Anda telah melewati batas waktu dan aset telah dilikuidasi oleh Bank.`);
        }

        let timeLeft = (loan.dueDate - Date.now()) / 3600000; 

        let msg = `🏦 *STATUS PINJAMAN AKTIF*\n──────────────────\n`;
        msg += `Jaminan: *${loan.qty.toLocaleString()} ${loan.ticker}*\n`;
        msg += `Tagihan: *Rp ${loan.debt.toLocaleString()}*\n`;
        msg += `Sisa Waktu: *${timeLeft.toFixed(1)} Jam lagi*\n`;
        msg += `──────────────────\n`;
        msg += `Ketik *${usedPrefix}tebus* untuk melunasi utang.`;

        return m.reply(msg);
    }
}

handler.help = ['gadai <ticker> <jumlah>', 'tebus', 'utang']
handler.tags = ['tulipnex']
handler.command = /^(gadai|pinjam|bayar|tebus|liabilitas|utang)$/i
handler.rpg = true;
handler.group = true;

module.exports = handler;