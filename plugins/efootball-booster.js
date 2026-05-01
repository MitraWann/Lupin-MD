const { getAllBoosters, findBoosterByName } = require('../lib/booster');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Jika tidak ada input, kirim daftar keseluruhan
    if (!text) {
        let list = getAllBoosters().map((b, i) => {
            let indicator = b.isRandom ? "🎰" : "❌";
            return `*${i + 1}.* ${b.name} _(${b.nameEn})_ ${indicator}`;
        }).join('\n');
        
        let replyMsg = `*— EFOOTBALL BOOSTERS —*\n\n`
        replyMsg += `Keterangan:\n`
        replyMsg += `🎰 = Berhak untuk Acak (Bisa pakai Token)\n`
        replyMsg += `❌ = Tidak Berhak untuk Acak\n\n`
        replyMsg += `Silakan masukkan nama booster (ID/EN) untuk melihat detailnya.\n`
        replyMsg += `*Contoh:* ${usedPrefix + command} Breakthrough\n\n`
        replyMsg += `*Daftar Booster:*\n${list}`
        
        return m.reply(replyMsg);
    }

    // Mencari booster spesifik (Support ID & EN)
    let result = findBoosterByName(text);
    
    if (!result) {
        return m.reply(`❌ Booster dengan kata kunci *"${text}"* tidak ditemukan.`);
    }

    // Format output detail
    let caption = `*— BOOSTER DETAIL —*\n\n`
    caption += `*🔖 Nama:* ${result.name} / ${result.nameEn}\n`
    caption += `*🎰 Bisa Diacak:* ${result.isRandom ? "Ya (Berhak untuk Acak)" : "Tidak"}\n`
    caption += `*📈 Statistik Plus:* ${result.stats.join(', ')}\n\n`
    caption += `*📖 Deskripsi:*\n_${result.desc}_`

    m.reply(caption);
}

handler.help = ['booster <nama/EN>']
handler.tags = ['info']
handler.command = /^(booster)$/i

module.exports = handler;