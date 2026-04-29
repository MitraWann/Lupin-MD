/**
 * TULIPNEX DIVIDEND SYSTEM
 * Location: ./plugins/trading-claimdividen.js
 * Feature: Profit Sharing for Board of Directors
 */

let handler = async (m, { conn }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    market.vault = market.vault || 0;

    // Mesin Pencari Top 3 TNX (Dewan Direksi)
    let users = global.db.data.users;
    let tnxHolders = Object.entries(users)
        .filter(u => (u[1].tulipnex || 0) > 0)
        .sort((a, b) => (b[1].tulipnex || 0) - (a[1].tulipnex || 0));

    let ceo = tnxHolders[0] || [null, {}];
    let kom = tnxHolders[1] || [null, {}];
    let dir = tnxHolders[2] || [null, {}];

    let isCEO = m.sender === ceo[0];
    let isKomisaris = m.sender === kom[0];
    let isDirektur = m.sender === dir[0];
    let isBoardMember = isCEO || isKomisaris || isDirektur;

    if (!isBoardMember) return m.reply(`[!] Akses Ditolak!\nHanya Top 3 Eksekutif TulipNex yang berhak mencairkan dividen.`);
    if (market.vault < 1000) return m.reply(`[!] Brankas kosong atau terlalu sedikit untuk dibagikan.`);

    // Cooldown Global untuk Dividen (24 Jam)
    market.lastDividendClaim = market.lastDividendClaim || 0;
    let cooldown = 86400000;
    let timeRemaining = (market.lastDividendClaim + cooldown) - Date.now();

    if (timeRemaining > 0) {
        let hours = Math.floor(timeRemaining / 3600000);
        let minutes = Math.floor((timeRemaining % 3600000) / 60000);
        return m.reply(`[!] Dividen sudah ditarik hari ini.\n⏳ Pencairan berikutnya dapat dilakukan dalam: *${hours} Jam ${minutes} Menit*`);
    }

    let totalVault = market.vault;
    let ceoShare = Math.floor(totalVault * 0.50); // 50%
    let komShare = Math.floor(totalVault * 0.30); // 30%
    let dirShare = Math.floor(totalVault * 0.20); // 20%
    let distributed = 0;

    let receipt = `💸 *PEMBAGIAN DIVIDEND PERUSAHAAN*\n──────────────────\nTotal Pencairan: Rp ${totalVault.toLocaleString('id-ID')}\n\n`;

    if (ceo[0]) {
        users[ceo[0]].money += ceoShare;
        distributed += ceoShare;
        receipt += `👑 CEO: Rp ${ceoShare.toLocaleString('id-ID')}\n`;
    }
    if (kom[0]) {
        users[kom[0]].money += komShare;
        distributed += komShare;
        receipt += `👔 Komisaris: Rp ${komShare.toLocaleString('id-ID')}\n`;
    }
    if (dir[0]) {
        users[dir[0]].money += dirShare;
        distributed += dirShare;
        receipt += `💼 Direktur: Rp ${dirShare.toLocaleString('id-ID')}\n`;
    }

    market.vault -= distributed; // Sisa uang (jika ada role yg kosong) tetap di vault
    market.lastDividendClaim = Date.now(); 
    
    receipt += `──────────────────\n_Dana telah dikirim ke rekening dompet masing-masing eksekutif._`;
    return m.reply(receipt);
}

handler.help = ['claimdividen'];
handler.tags = ['tulipnex'];
handler.command = /^(claimdividen|claimdevidend)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;