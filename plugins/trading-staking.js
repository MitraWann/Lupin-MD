/**
 * TULIPNEX CYBER-GREENHOUSE (STAKING / FARMING)
 * Location: ./plugins/trading-staking.js
 * Feature: Kunci aset untuk mendapatkan passive income (Separated View & Harvest with Hourly Rate & Auto-Guide)
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    user.staking = user.staking || {}; // Inisialisasi kebun pemain

    const marketConfig = {
        IVL: { db: 'ivylink', apy: 500 },     // Rp 500 per jam / unit
        LBT: { db: 'lilybit', apy: 1500 },    // Rp 1.500 per jam / unit
        IRC: { db: 'iriscode', apy: 5000 },
        LTN: { db: 'lotusnet', apy: 15000 },
        RSX: { db: 'rosex', apy: 50000 },
        TNX: { db: 'tulipnex', apy: 200000 }  // Rp 200.000 per jam / unit
    };

    let action = command.toLowerCase();

    // ===================================
    // COMMAND 1: .stake / .tanam 
    // ===================================
    if (action === 'stake' || action === 'tanam') {
        // Panduan otomatis jika format salah / argumen kurang
        if (args.length < 2) {
            let guide = `🌱 *CARA MENANAM ASET (STAKING)*\n──────────────────\n`;
            guide += `Kunci aset Anda untuk mendapatkan profit per jam.\n\n`;
            guide += `*Format:* ${usedPrefix}${command} <ticker> <jumlah>\n`;
            guide += `*Contoh:* ${usedPrefix}${command} TNX 10\n\n`;
            guide += `*Daftar Ticker:* IVL, LBT, IRC, LTN, RSX, TNX`;
            return m.reply(guide);
        }

        let ticker = args[0].toUpperCase();
        let qty = parseInt(args[1]);

        if (!marketConfig[ticker]) return m.reply(`[!] Ticker tidak valid. Daftar: IVL, LBT, IRC, LTN, RSX, TNX`);
        if (isNaN(qty) || qty <= 0) return m.reply(`[!] Jumlah aset tidak valid.\nContoh: *${usedPrefix}${command} TNX 10*`);

        let itemDb = marketConfig[ticker].db;
        if ((user[itemDb] || 0) < qty) return m.reply(`[!] Aset tidak cukup. Anda hanya punya ${(user[itemDb] || 0).toLocaleString()} ${ticker}.`);

        // Pindahkan aset dari dompet ke kebun (staking)
        user[itemDb] -= qty;
        
        if (!user.staking[ticker]) {
            user.staking[ticker] = { amount: 0, lastHarvest: Date.now() };
        } else {
            // Jika nambah modal tanaman, otomatis panen dulu agar perhitungan fair
            let timePassed = (Date.now() - user.staking[ticker].lastHarvest) / 3600000; // dalam jam
            let reward = Math.floor(timePassed * user.staking[ticker].amount * marketConfig[ticker].apy);
            if (reward > 0) user.money += reward;
            user.staking[ticker].lastHarvest = Date.now(); // Reset waktu
        }

        user.staking[ticker].amount += qty;

        let msg = `🌱 *CYBER-GREENHOUSE TULIPNEX*\n──────────────────\n`;
        msg += `Berhasil menanam *${qty.toLocaleString()} ${ticker}*.\n`;
        msg += `Estimasi Hasil: *Rp ${marketConfig[ticker].apy.toLocaleString()} / jam* per unit.\n`;
        msg += `Ketik *${usedPrefix}kebun* untuk memantau status tanaman Anda!`;
        return m.reply(msg);
    }

    // ===================================
    // COMMAND 2: .unstake / .cabut
    // ===================================
    if (action === 'unstake' || action === 'cabut') {
        // Panduan otomatis jika format salah
        if (args.length < 2) {
            let guide = `🚜 *CARA MENCABUT ASET (UNSTAKE)*\n──────────────────\n`;
            guide += `Tarik kembali aset yang sedang ditanam ke brankas utama.\n\n`;
            guide += `*Format:* ${usedPrefix}${command} <ticker> <jumlah>\n`;
            guide += `*Contoh:* ${usedPrefix}${command} TNX 10`;
            return m.reply(guide);
        }

        let ticker = args[0].toUpperCase();
        let qty = parseInt(args[1]);

        if (!user.staking[ticker] || user.staking[ticker].amount < qty) {
            return m.reply(`[!] Anda tidak memiliki ${qty.toLocaleString()} ${ticker} yang sedang ditanam.`);
        }

        // Otomatis panen dulu sebelum dicabut
        let timePassed = (Date.now() - user.staking[ticker].lastHarvest) / 3600000;
        let reward = Math.floor(timePassed * user.staking[ticker].amount * marketConfig[ticker].apy);
        if (reward > 0) user.money += reward;

        // Kembalikan aset ke dompet utama
        let itemDb = marketConfig[ticker].db;
        user.staking[ticker].amount -= qty;
        user[itemDb] += qty;
        user.staking[ticker].lastHarvest = Date.now();

        if (user.staking[ticker].amount === 0) delete user.staking[ticker];

        return m.reply(`🚜 Berhasil mencabut *${qty.toLocaleString()} ${ticker}* dari kebun ke dompet Anda.\nProfit terakhir (Rp ${reward.toLocaleString()}) otomatis masuk saldo.`);
    }

    // ===================================
    // COMMAND 3: .kebun (HANYA MELIHAT STATUS)
    // ===================================
    if (action === 'kebun' || action === 'garden') {
        let msg = `🚜 *STATUS CYBER-GREENHOUSE*\n──────────────────\n`;
        let count = 0;
        let totalEstimated = 0;
        let totalRate = 0; 

        for (let t in user.staking) {
            let stakeData = user.staking[t];
            let timePassed = (Date.now() - stakeData.lastHarvest) / 3600000; // Kalkulasi jam
            let ratePerJam = stakeData.amount * marketConfig[t].apy; // Keuntungan per jam untuk item ini
            let reward = Math.floor(timePassed * ratePerJam);

            msg += `• *${t}*: ${stakeData.amount.toLocaleString()} unit\n`;
            msg += `  📈 _Rate: Rp ${ratePerJam.toLocaleString()} / jam_\n`;
            msg += `  ⏳ _Waktu: ${timePassed.toFixed(2)} jam_\n`;
            msg += `  💰 _Profit Tersedia: Rp ${reward.toLocaleString()}_\n\n`;

            totalEstimated += reward;
            totalRate += ratePerJam;
            count++;
        }

        if (count === 0) return m.reply(`[!] Kebun Anda masih kosong.\nGunakan *${usedPrefix}tanam <ticker> <jumlah>* untuk mulai bertani.`);

        msg += `──────────────────\n`;
        msg += `💡 Total Rate: *Rp ${totalRate.toLocaleString()} / jam*\n`;
        msg += `💡 Total Estimasi Profit: *Rp ${totalEstimated.toLocaleString()}*\n`;
        msg += `Ketik *${usedPrefix}panen* untuk mengklaim semua profit ke brankas tunai Anda.`;
        
        return m.reply(msg);
    }

    // ===================================
    // COMMAND 4: .panen (MENGKLAIM PROFIT)
    // ===================================
    if (action === 'panen' || action === 'harvest') {
        let totalReward = 0;
        let msg = `🚜 *HASIL PANEN HARI INI*\n──────────────────\n`;
        let count = 0;

        for (let t in user.staking) {
            let stakeData = user.staking[t];
            let timePassed = (Date.now() - stakeData.lastHarvest) / 3600000; // jam
            let ratePerJam = stakeData.amount * marketConfig[t].apy;
            let reward = Math.floor(timePassed * ratePerJam);

            if (reward > 0) {
                msg += `• *${t}*: + Rp ${reward.toLocaleString()}\n`;
                totalReward += reward;
                user.staking[t].lastHarvest = Date.now(); // Reset timer setelah dipanen
            }
            count++;
        }

        if (count === 0) return m.reply(`[!] Anda belum menanam (stake) aset apa pun di kebun.`);
        if (totalReward === 0) return m.reply(`[!] Belum ada profit yang bisa dipanen. Tunggu beberapa saat lagi agar bunganya tumbuh.`);

        user.money += totalReward;
        msg += `──────────────────\n`;
        msg += `✅ Berhasil memanen total *Rp ${totalReward.toLocaleString()}* ke brankas utama Anda!`;
        
        return m.reply(msg);
    }
}

handler.help = ['tanam <ticker> <jumlah>', 'cabut <ticker> <jumlah>', 'kebun', 'panen']
handler.tags = ['tulipnex']
handler.command = /^(stake|tanam|unstake|cabut|panen|harvest|kebun|garden)$/i
handler.rpg = true
handler.group = true

module.exports = handler;