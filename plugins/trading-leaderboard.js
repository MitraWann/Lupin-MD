/**
 * TULIPNEX TOP TRADERS LEADERBOARD
 * Location: ./plugins/trading-leaderboard.js
 * Feature: Kalkulasi Total Net Worth (Uang Tunai + Nilai Portofolio Aset)
 */

let handler = async (m, { conn, participants }) => {
    // 1. Cek apakah sistem trading aktif
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    let prices = market.prices || {};

    // 2. Konfigurasi Item Pasar
    const marketConfig = {
        IVL: { name: 'IvyLink' },
        LBT: { name: 'LilyBit' },
        IRC: { name: 'IrisCode' },
        LTN: { name: 'LotusNet' },
        RSX: { name: 'RoseX' },
        TNX: { name: 'TulipNex' }
    };

    // 3. Ambil data semua user
    let users = Object.entries(global.db.data.users);
    let traderStats = [];

    // 4. Kalkulasi Kekayaan Bersih (Net Worth) setiap pemain
    for (let [jid, data] of users) {
        let money = data.money || 0;
        let portfolioValue = 0;

        // Hitung nilai setiap aset berdasarkan harga pasar saat ini
        for (let ticker in marketConfig) {
            let itemName = marketConfig[ticker].name.toLowerCase();
            let count = data[itemName] || 0;
            let currentPrice = prices[ticker] || 0;
            portfolioValue += (count * currentPrice);
        }

        let netWorth = money + portfolioValue;

        // Hanya masukkan pemain yang punya kekayaan lebih dari 0
        if (netWorth > 0) {
            traderStats.push({
                jid: jid,
                name: data.name || conn.getName(jid) || 'Unknown Trader',
                money: money,
                portfolio: portfolioValue,
                netWorth: netWorth
            });
        }
    }

    // Jika belum ada yang main
    if (traderStats.length === 0) {
        return m.reply('📉 Belum ada investor di pasar TulipNex.');
    }

    // 5. Urutkan dari yang paling kaya (Descending)
    traderStats.sort((a, b) => b.netWorth - a.netWorth);

    // Ambil Top 10 saja
    let topTraders = traderStats.slice(0, 10);

    // 6. Susun Teks Papan Peringkat
    let text = `🏆 *TULIPNEX FORBES TOP 10*\n`;
    text += `_Peringkat Investor Terkaya_\n`;
    text += `──────────────────\n`;

    topTraders.forEach((trader, index) => {
        let rank = index + 1;
        let medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '💼';
        
        text += `${medal} *${trader.name}*\n`;
        text += `🏛️ Net Worth: \n> Rp ${trader.netWorth.toLocaleString()}\n`;
        text += `💵 Cash: \n> Rp ${trader.money.toLocaleString()}\n`;
        text += `📦 Asset: \n> Rp ${trader.portfolio.toLocaleString()}\n`;
        
        // Kasih tanda jika ini adalah user yang mengetik perintah
        if (trader.jid === m.sender) {
            text += `   *(📍 Anda di sini)*\n`;
        }
        text += `\n`;
    });

    text += `──────────────────\n`;
    text += `💡 _Net Worth dihitung dari uang tunai + nilai jual seluruh aset di pasar saat ini._`;

    // 7. Kirim Papan Peringkat
    await conn.reply(m.chat, text.trim(), m, {
        contextInfo: {
            mentionedJid: topTraders.map(t => t.jid) // Agar nama kontaknya tertag jika pakai @
        }
    });
}

handler.help = ['toptrader', 'forbes']
handler.tags = ['tulipnex']
handler.command = /^(toptrader|topinvestor|toptulip|forbes)$/i
handler.rpg = true;
handler.group = true;

module.exports = handler;