const fs = require('fs');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let type = (args[0] || '').toLowerCase();
    let users = global.db.data.users;

    if (type === 'all') {
        global.db.data.users = {};
        m.reply('✅ *BAM!* Seluruh database pemain telah musnah dan dikosongkan secara permanen.');
    } 
    else if (type === 'limit') {
        for (let jid in users) {
            users[jid].limit = 10; // Ubah angka 10 sesuai limit default bot Anda
        }
        m.reply('♻️ *RESET BERHASIL*\nSeluruh limit pemain telah dikembalikan menjadi 10!');
    } 
    else if (type === 'rpg') {
        for (let jid in users) {
            users[jid].money = 0;
            users[jid].exp = 0;
            users[jid].level = 0;
            users[jid].role = 'Newbie';
        }
        m.reply('💥 *RESET RPG BERHASIL*\nSeluruh uang, exp, level, dan pangkat pemain telah direset menjadi 0 (Newbie).');
    } 
    else if (type === 'group') {
        try {
            // Menimpa isi file Info-listgroup.json menjadi objek kosong {}
            fs.writeFileSync('./plugins/Info-listgroup.json', '{}');
            m.reply('🏢 *RESET GRUP BERHASIL*\nSeluruh database pengaturan grup (Info-listgroup.json) telah dikosongkan.');
        } catch (e) {
            m.reply('❌ *GAGAL!*\nTerjadi kesalahan saat mereset file database grup: ' + e.message);
        }
    }
    else {
        m.reply(`⚠️ *Format Salah!*\n\nSilakan pilih apa yang ingin Anda bersihkan:\n*1.* ${usedPrefix + command} all _(Hapus total seluruh pengguna)_\n*2.* ${usedPrefix + command} limit _(Reset limit harian)_\n*3.* ${usedPrefix + command} rpg _(Reset uang, exp, dan level)_\n*4.* ${usedPrefix + command} group _(Reset pengaturan list grup)_`);
    }
}

handler.help = ['resetdb <pilihan>'];
handler.tags = ['owner']; // Akan masuk ke menu dengan stempel (Ⓞ)
handler.command = /^(resetdb|cleardb)$/i;
handler.owner = true; // Kunci gembok mutlak!

module.exports = handler;
