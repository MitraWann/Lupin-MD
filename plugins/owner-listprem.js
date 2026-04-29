/**
 * TULIPNEX PREMIUM LIST
 * Location: ./plugins/owner-listprem.js
 * Feature: Menampilkan daftar pengguna premium beserta sisa durasinya dengan UI menarik.
 */

let handler = async (m, { conn, usedPrefix }) => {
    let users = global.db.data.users;
    let premUsers = [];
    let now = Date.now();

    // Mengumpulkan semua pengguna yang berstatus premium
    for (let jid in users) {
        if (users[jid].premium) {
            premUsers.push({
                jid: jid,
                name: users[jid].name || 'User',
                premiumTime: users[jid].premiumTime || 0
            });
        }
    }

    if (premUsers.length === 0) {
        return m.reply('❌ *Tidak ada pengguna Premium saat ini.*');
    }

    // Mengurutkan berdasarkan waktu premium tersisa (opsional)
    premUsers.sort((a, b) => b.premiumTime - a.premiumTime);

    let caption = `*╭───[ 🌟 DAFTAR PREMIUM ]───*\n`;
    caption += `*│* 👥 *Total:* ${premUsers.length} Pengguna\n`;
    caption += `*├──────────────────*\n`;

    let mentioned = [];

    premUsers.forEach((user, i) => {
        let tag = `@${user.jid.split('@')[0]}`;
        mentioned.push(user.jid);
        
        // Kalkulasi sisa waktu
        let sisaWaktu = user.premiumTime - now;
        let timeStr = '';

        if (user.premiumTime === 0 || user.premiumTime === -1) {
            timeStr = '∞ Permanen';
        } else if (sisaWaktu <= 0) {
            timeStr = '⚠️ Expired / Kedaluwarsa';
        } else {
            timeStr = msToDate(sisaWaktu);
        }

        caption += `*│* ${i + 1}. ${tag}\n`;
        caption += `*│* └ ⏳ *Sisa:* ${timeStr}\n`;
    });

    caption += `*╰──────────────────*\n\n`;
    caption += `_Ingin upgrade ke Premium?_\n_Ketik *${usedPrefix}owner* untuk info lebih lanjut._`;

    // Menggunakan contextInfo agar tag menjadi biru (clickable)
    return conn.reply(m.chat, caption, m, {
        contextInfo: {
            mentionedJid: mentioned
        }
    });
}

handler.help = ['listpremium'];
handler.tags = ['info'];
handler.command = /^(listpremium|premiumlist|listprem|premlist)$/i;

module.exports = handler;

// Fungsi untuk mengubah milidetik menjadi format string (Hari, Jam, Menit)
function msToDate(ms) {
    if (isNaN(ms) || ms < 0) return 'Expired';
    let d = Math.floor(ms / 86400000);
    let h = Math.floor((ms % 86400000) / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    
    let res = '';
    if (d > 0) res += `${d} Hari `;
    if (h > 0) res += `${h} Jam `;
    if (m > 0) res += `${m} Menit`;
    if (d === 0 && h === 0 && m === 0) res += `${s} Detik`;
    
    return res.trim();
}