let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    try {
        let db = global.db.data;
        let users = Object.keys(db.users || {});
        let chats = Object.keys(db.chats || {});

        if (!args[0]) {
            let txt = `*🧹 DATABASE CLEANER TOOL*

Gunakan perintah ini dengan hati-hati. Disarankan untuk backup \`database.json\` terlebih dahulu.

*Cara Penggunaan:*
1. *${usedPrefix + command} check*
   _Melihat statistik DB dan potensi data sampah._
2. *${usedPrefix + command} clearuser*
   _Menghapus pengguna yang tidak memiliki aset (EXP, Saldo, dll 0)._
3. *${usedPrefix + command} delkey <nama_key>*
   _Menghapus properti/key spesifik dari semua pengguna (sisa plugin lama)._

Contoh: \`${usedPrefix + command} delkey limit_rpg_lama\``;
            return m.reply(txt);
        }

        if (args[0].toLowerCase() === 'check') {
            if (global.wait) m.reply(global.wait);
            
            let ghostUsers = 0;
            for (let jid of users) {
                let user = db.users[jid];
                // Kriteria Ghost User: Tidak punya aset penting TulipNex
                if (user && (!user.exp || user.exp === 0) && (!user.saldo || user.saldo === 0) && (!user.limit || user.limit === 0)) {
                    ghostUsers++;
                }
            }

            let replyTxt = `*📊 STATISTIK DATABASE*
- Total Users: *${users.length}*
- Total Chats (Grup/PC): *${chats.length}*

*⚠️ Potensi Data Sampah:*
- *${ghostUsers}* Pengguna tidak aktif (tanpa aset/saldo).

_Gunakan *${usedPrefix + command} clearuser* untuk membersihkan pengguna tidak aktif._`;
            return m.reply(replyTxt);
        }

        if (args[0].toLowerCase() === 'clearuser') {
            if (global.wait) m.reply(global.wait);
            
            let deleted = 0;
            for (let jid of users) {
                let user = db.users[jid];
                if (user && (!user.exp || user.exp === 0) && (!user.saldo || user.saldo === 0) && (!user.limit || user.limit === 0)) {
                    delete db.users[jid];
                    deleted++;
                }
            }
            return m.reply(`*✅ Pembersihan Berhasil*\nBerhasil menghapus *${deleted}* pengguna tidak aktif dari database.`);
        }

        if (args[0].toLowerCase() === 'delkey') {
            let targetKey = args[1];
            if (!targetKey) return m.reply(`Masukkan nama key yang ingin dihapus!\nContoh: *${usedPrefix + command} delkey nama_key*`);
            
            if (global.wait) m.reply(global.wait);
            
            let deletedCount = 0;
            for (let jid of users) {
                if (db.users[jid] && db.users[jid][targetKey] !== undefined) {
                    delete db.users[jid][targetKey];
                    deletedCount++;
                }
            }
            return m.reply(`*✅ Penghapusan Key Berhasil*\nProperti *${targetKey}* telah dihapus dari *${deletedCount}* pengguna.`);
        }

        m.reply('Opsi tidak dikenali. Ketik *' + usedPrefix + command + '* untuk melihat menu.');

    } catch (e) {
        console.error(e);
        m.reply(global.eror || 'Terjadi kesalahan saat memproses database.');
    }
}

handler.help = ['dbclean'];
handler.tags = ['owner'];
handler.command = /^(dbclean|cleandb)$/i;
handler.owner = true;

module.exports = handler;