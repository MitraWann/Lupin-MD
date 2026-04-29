/**
 * TULIPNEX P2P SMART CONTRACT (ESCROW SYSTEM)
 * Location: ./plugins/trading-p2p.js
 * Feature: Anti-Scam Escrow. Aset penjual dikunci (locked) saat menawarkan.
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    global.db.data.tradingOffers = global.db.data.tradingOffers || {};
    let offers = global.db.data.tradingOffers;

    const marketConfig = {
        IVL: { name: 'IvyLink', db: 'ivylink' },
        LBT: { name: 'LilyBit', db: 'lilybit' },
        IRC: { name: 'IrisCode', db: 'iriscode' },
        LTN: { name: 'LotusNet', db: 'lotusnet' },
        RSX: { name: 'RoseX', db: 'rosex' },
        TNX: { name: 'TulipNex', db: 'tulipnex' }
    };

    let action = command.toLowerCase();
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

    // ==========================================
    // COMMAND 1: MEMBUAT PENAWARAN (ESCROW LOCK)
    // ==========================================
    if (action === 'offeraset' || action === 'jualaset') {
        let filteredArgs = args.filter(a => !a.startsWith('@'));
        let ticker = (filteredArgs[0] || '').toUpperCase();
        let qty = parseInt(filteredArgs[1]);
        let price = parseInt(filteredArgs[2]); 

        if (!target) {
            let petunjuk = `🤝 *TULIPNEX P2P TRADING*\n──────────────────\n`;
            petunjuk += `Jual aset Anda langsung ke pemain lain dengan harga kesepakatan!\n\n`;
            petunjuk += `*Format:* ${usedPrefix}${command} @user <ticker> <jumlah> <total_harga>\n`;
            petunjuk += `*Contoh:* ${usedPrefix}${command} @62812... TNX 10 25000000000\n`;
            petunjuk += `⚠️ _Catatan: Aset Anda akan dikunci (Escrow) selama 5 menit selama penawaran berlangsung._`;
            return m.reply(petunjuk);
        }

        if (target === m.sender) return m.reply('[!] Anda tidak bisa berdagang dengan diri sendiri.');
        if (!marketConfig[ticker]) return m.reply(`[!] Ticker *${ticker}* tidak dikenali.`);
        if (isNaN(qty) || qty <= 0) return m.reply('[!] Jumlah aset tidak valid.');
        if (isNaN(price) || price <= 0) return m.reply('[!] Total harga tidak valid.');

        let senderData = global.db.data.users[m.sender];
        let itemDb = marketConfig[ticker].db;

        if ((senderData[itemDb] || 0) < qty) {
            return m.reply(`[!] Anda tidak memiliki cukup aset. Saldo Anda: *${(senderData[itemDb] || 0).toLocaleString()} ${ticker}*`);
        }

        let offerId = target + '_' + m.sender;
        
        // Cek apakah sudah ada penawaran gantung ke orang yang sama
        if (offers[offerId]) {
             return m.reply(`[!] Anda masih memiliki penawaran yang menggantung ke pemain ini. Tunggu hingga ditolak atau kedaluwarsa.`);
        }

        // 🔥 ESCROW EXECUTION: Kunci aset penjual (Potong dari dompet)
        senderData[itemDb] -= qty;

        offers[offerId] = {
            seller: m.sender,
            buyer: target,
            ticker: ticker,
            qty: qty,
            price: price,
            expired: Date.now() + 300000 // 5 menit
        };

        let tagSender = `@${m.sender.replace(/@.+/, '')}`;
        let tagTarget = `@${target.replace(/@.+/, '')}`;

        let msg = `📜 *KONTRAK PENAWARAN P2P (ESCROWED)*\n──────────────────\n`;
        msg += `Penjual: ${tagSender}\n`;
        msg += `Pembeli: ${tagTarget}\n`;
        msg += `Aset: *${qty.toLocaleString()} ${ticker}* 🔒 _(Terkunci di Sistem)_\n`;
        msg += `Harga Diminta: *Rp ${price.toLocaleString()}*\n`;
        msg += `──────────────────\n`;
        msg += `Hai ${tagTarget}, Anda mendapat tawaran aset!\n`;
        msg += `Ketik *${usedPrefix}terimaaset* ${tagSender} untuk membeli, atau\n`;
        msg += `Ketik *${usedPrefix}tolakaset* ${tagSender} untuk menolak.\n\n`;
        msg += `⏳ _Kontrak hangus dalam 5 menit. Jika hangus/ditolak, aset kembali ke penjual._`;

        return conn.reply(m.chat, msg, m, { contextInfo: { mentionedJid: [m.sender, target] } });
    }

    // ==========================================
    // COMMAND 2 & 3: TERIMA / TOLAK 
    // ==========================================
    if (action === 'terimaaset' || action === 'tolakaset' || action === 'accaset') {
        if (!target) return m.reply(`[!] Tag orang yang menawarkan aset kepada Anda.\nContoh: *${usedPrefix}${command} @user*`);

        let offerId = m.sender + '_' + target;
        let offer = offers[offerId];

        if (!offer) return m.reply('[!] Tidak ada penawaran aktif dari pemain tersebut untuk Anda.');
        
        if (Date.now() > offer.expired) {
            // Biarkan Garbage Collector yang mengurus refund-nya
            return m.reply('[!] Waktu penawaran sudah habis (kedaluwarsa). Sistem sedang mengembalikan aset ke penjual.');
        }

        let tagTarget = `@${target.replace(/@.+/, '')}`;
        let tagSender = `@${m.sender.replace(/@.+/, '')}`;
        let sellerData = global.db.data.users[offer.seller];
        let itemDb = marketConfig[offer.ticker].db;

        // JIKA DITOLAK
        if (action === 'tolakaset') {
            // 🔥 ESCROW REFUND: Kembalikan aset ke penjual
            sellerData[itemDb] = (sellerData[itemDb] || 0) + offer.qty;
            delete offers[offerId];
            
            let tolakMsg = `❌ Anda telah *menolak* penawaran dari ${tagTarget}. Aset sebesar *${offer.qty.toLocaleString()} ${offer.ticker}* telah dikembalikan ke brankas penjual.`;
            return conn.reply(m.chat, tolakMsg, m, { contextInfo: { mentionedJid: [target] } });
        }

        // JIKA DITERIMA
        let buyerData = global.db.data.users[m.sender];

        if (buyerData.money < offer.price) {
            return m.reply(`[!] Uang Anda tidak cukup! Anda butuh *Rp ${offer.price.toLocaleString()}*.`);
        }

        // 🔥 EKSEKUSI TRANSAKSI: Aset sudah di tangan bot, tinggal diserahkan ke pembeli
        buyerData.money -= offer.price;
        sellerData.money += offer.price;
        buyerData[itemDb] = (buyerData[itemDb] || 0) + offer.qty;

        delete offers[offerId];

        let receipt = `🤝 *P2P TRADE BERHASIL*\n──────────────────\n`;
        receipt += `Pembeli: ${tagSender}\n`;
        receipt += `Penjual: ${tagTarget}\n`;
        receipt += `Barang: *${offer.qty.toLocaleString()} ${offer.ticker}* 🔓\n`;
        receipt += `Total Dibayar: *Rp ${offer.price.toLocaleString()}*\n`;
        receipt += `──────────────────\n`;
        receipt += `_Aset Escrow telah dicairkan dan dana telah ditransfer._`;

        return conn.reply(m.chat, receipt, m, { contextInfo: { mentionedJid: [m.sender, target] } });
    }
}

handler.help = ['offeraset @user <ticker> <qty> <harga>', 'terimaaset @user', 'tolakaset @user']
handler.tags = ['tulipnex']
handler.command = /^(offeraset|jualaset|terimaaset|accaset|tolakaset)$/i
handler.rpg = true;
handler.group = true;

module.exports = handler;