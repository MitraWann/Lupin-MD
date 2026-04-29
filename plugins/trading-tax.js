/**
 * TULIPNEX TAX CONTROL SYSTEM
 * Location: ./plugins/trading-tax.js
 * Feature: Tax Veto System (Ajukan, Setuju, Tolak Pajak)
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    market.taxRates = market.taxRates || { IVL: 1.5, LBT: 1.5, IRC: 1.5, LTN: 1.5, RSX: 1.5, TNX: 2.5 };
    market.taxProposal = market.taxProposal || null;

    const validTickers = ['IVL', 'LBT', 'IRC', 'LTN', 'RSX', 'TNX'];

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

    let action = command.toLowerCase();

    // ==========================================
    // COMMAND: .ajukanpajak (Khusus CEO)
    // ==========================================
    if (action === 'ajukanpajak') {
        if (!isCEO) return m.reply(`[!] Akses Ditolak! Hanya CEO (Rank 1 TNX) yang bisa mengusulkan undang-undang pajak.`);
        
        if (args.length < 2) return m.reply(`*Format:* ${usedPrefix}ajukanpajak <Ticker/ALL> <Persen>\n*Contoh:* ${usedPrefix}ajukanpajak ALL 5`);

        let targetTicker = args[0].toUpperCase();
        let newTax = parseFloat(args[1]);

        if (targetTicker !== 'ALL' && !validTickers.includes(targetTicker)) return m.reply(`[!] Ticker tidak valid.`);
        if (isNaN(newTax) || newTax < 1.0 || newTax > 10.0) return m.reply(`[!] Ditolak Sistem: Pajak harus berupa angka antara 1% hingga 10% !`);

        // --- BYPASS LOGIC: JIKA CEO SENDRIAN (DIKTATOR) ---
        if (!kom[0] && !dir[0]) {
            let tickersToUpdate = targetTicker === 'ALL' ? validTickers : [targetTicker];
            for (let t of tickersToUpdate) {
                market.taxRates[t] = newTax;
            }
            market.taxProposal = null;

            let msg = `⚖️ *REGULASI PAJAK DISAHKAN (OTORITER)*\n──────────────────\n`;
            msg += `Dikarenakan belum ada pemain lain yang menjabat sebagai Komisaris atau Direktur, CEO memegang kendali penuh!\n\n`;
            msg += `Pajak bursa untuk *${targetTicker}* resmi diubah menjadi *${newTax}%*.\n`;
            
            if (market.announcerGroup && market.announcerGroup !== m.chat) {
                await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\n\n` + msg, null);
            }
            return m.reply(msg);
        }

        // Simpan usulan di sistem (Jika sistem Oligarki aktif)
        market.taxProposal = { ticker: targetTicker, newTax: newTax, approvals: [] };

        let msg = `📜 *DRAFT PAJAK BARU DIAJUKAN (PENDING)*\n──────────────────\n`;
        msg += `CEO telah menyusun regulasi pajak baru:\n\n`;
        msg += `🎯 Target: *${targetTicker}*\n`;
        msg += `📈 Tarif Baru: *${newTax}%*\n`;
        msg += `──────────────────\n`;
        msg += `⚠️ _Regulasi ini belum aktif!_\nDiperlukan persetujuan dari Komisaris Utama atau Direktur Eksekutif.\n`;
        msg += `Ketik *${usedPrefix}setujupajak* untuk ACC, atau *${usedPrefix}tolakpajak* untuk Veto.`;

        if (market.announcerGroup && market.announcerGroup !== m.chat) {
            await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\n\n` + msg, null);
        }
        return m.reply(msg);
    }

    // ==========================================
    // COMMAND: .setujupajak & .tolakpajak (VETO)
    // ==========================================
    if (action === 'setujupajak' || action === 'tolakpajak') {
        if (!isKomisaris && !isDirektur) return m.reply(`[!] Akses Ditolak! Hanya Komisaris atau Direktur yang memiliki hak Veto.`);
        if (!market.taxProposal) return m.reply(`[!] Tidak ada usulan pajak dari CEO yang sedang tertunda.`);

        let proposal = market.taxProposal;
        let roleName = isKomisaris ? 'Komisaris Utama' : 'Direktur Eksekutif';

        if (action === 'setujupajak') {
            proposal.approvals = proposal.approvals || [];
            
            if (proposal.approvals.includes(m.sender)) {
                return m.reply(`[!] Anda sudah menyetujui draft pajak ini. Menunggu persetujuan direksi lainnya.`);
            }
            
            // Tambahkan persetujuan orang tersebut
            proposal.approvals.push(m.sender);

            // Filter orang yang dibutuhkan untuk ACC (hanya posisi yang terisi)
            let requiredApprovers = [kom[0], dir[0]].filter(v => v !== null);
            
            // Cek apakah semua orang yang dibutuhkan sudah menyetujui
            let isFullyApproved = requiredApprovers.every(approver => proposal.approvals.includes(approver));

            if (isFullyApproved) {
                let tickersToUpdate = proposal.ticker === 'ALL' ? validTickers : [proposal.ticker];
                for (let t of tickersToUpdate) {
                    market.taxRates[t] = proposal.newTax;
                }
                market.taxProposal = null; // Clear proposal

                let msg = `⚖️ *REGULASI PAJAK DISAHKAN (APPROVED)*\n──────────────────\n`;
                if (requiredApprovers.length > 1) {
                    msg += `Seluruh anggota dewan direksi telah *menyetujui* draft pajak dari CEO.\n\n`;
                } else {
                    msg += `${roleName} telah *menyetujui* draft pajak dari CEO.\n\n`;
                }
                msg += `Mulai saat ini, pajak bursa untuk *${proposal.ticker}* resmi diubah menjadi *${proposal.newTax}%*.\n`;
                
                if (market.announcerGroup && market.announcerGroup !== m.chat) {
                    await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\n\n` + msg, null);
                }
                return m.reply(msg);
                
            } else {
                let msg = `📝 *PERSETUJUAN DITERIMA (MENUNGGU)*\n──────────────────\n`;
                msg += `${roleName} telah *menyetujui* draft pajak dari CEO.\n\n`;
                msg += `⏳ _Masih menunggu persetujuan dari anggota direksi lainnya sebelum pajak dapat disahkan!_`;
                
                if (market.announcerGroup && market.announcerGroup !== m.chat) {
                    await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\n\n` + msg, null);
                }
                return m.reply(msg);
            }
            
        } else {
            // Tolak Pajak (Veto)
            market.taxProposal = null; // Clear proposal
            
            let msg = `❌ *REGULASI PAJAK DITOLAK (VETO)*\n──────────────────\n`;
            msg += `${roleName} menggunakan hak vetonya untuk *menolak* draft pajak dari CEO!\n\n`;
            msg += `Usulan pajak untuk ${proposal.ticker} (${proposal.newTax}%) telah dibuang ke tempat sampah. Pajak lama tetap berlaku.`;

            if (market.announcerGroup && market.announcerGroup !== m.chat) {
                await conn.reply(market.announcerGroup, `📢 *TULIPNEX INFO*\n\n` + msg, null);
            }
            return m.reply(msg);
        }
    }
}

handler.help = ['ajukanpajak', 'setujupajak', 'tolakpajak'];
handler.tags = ['tulipnex'];
handler.command = /^(ajukanpajak|setujupajak|tolakpajak)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;