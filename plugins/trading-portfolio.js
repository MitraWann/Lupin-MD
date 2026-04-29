/**
 * TULIPNEX TRADING PORTFOLIO
 * Location: ./plugins/trading-portfolio.js
 * Feature: Check User Asset Holdings & Net Worth
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    const marketConfig = {
        IVL: { name: 'IvyLink', min: 3000, max: 99999, vol: 0.03 },
        LBT: { name: 'LilyBit', min: 100000, max: 999999, vol: 0.05 },
        IRC: { name: 'IrisCode', min: 1000000, max: 9999999, vol: 0.05 },
        LTN: { name: 'LotusNet', min: 10000000, max: 99999999, vol: 0.05 },
        RSX: { name: 'RoseX', min: 100000000, max: 999999999, vol: 0.05 },
        TNX: { name: 'TulipNex', min: 1000000000, max: 10000000000, vol: 0.05 }
    }

    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) global.db.data.settings.trading = {};
    
    let market = global.db.data.settings.trading;
    market.prices = market.prices || Object.fromEntries(Object.entries(marketConfig).map(([k, v]) => [k, v.min]));

    let user = global.db.data.users[m.sender];
    if (!user) return m.reply('[!] Data pengguna tidak ditemukan di database.');

    let totalAssetValue = 0;
    let caption = `💼 *USER ASSET PORTFOLIO*\n`;
    caption += `_Client: ${user.name}_\n`;
    caption += `──────────────────\n`;
    
    let hasAsset = false;
    for (let ticker in marketConfig) {
        let itemName = marketConfig[ticker].name.toLowerCase();
        let count = user[itemName] || 0;
        let currentPrice = market.prices[ticker] || 0;
        
        if (count > 0) {
            hasAsset = true;
            let assetValue = count * currentPrice;
            totalAssetValue += assetValue;
            caption += `• *${ticker}*: ${count.toLocaleString('id-ID')} unit \n> Rp ${assetValue.toLocaleString('id-ID')}\n`;
        }
    }
    
    if (!hasAsset) caption += `_Anda belum memiliki aset apapun._\n`;
    
    caption += `──────────────────\n`;
    caption += `💵 *Liquid Cash*: \n> Rp ${user.money.toLocaleString('id-ID')}\n`;
    caption += `🏛️ *Total Networth*: \n> Rp ${(user.money + totalAssetValue).toLocaleString('id-ID')}\n`;
    
    return m.reply(caption);
}

handler.help = ['portfolio'];
handler.tags = ['tulipnex'];
handler.command = /^(pf|porto|portfolio)$/i;
handler.rpg = true;
handler.group = true;

module.exports = handler;