/**
 * Plugin: Manajer Moderator (Database Persistent)
 * Deskripsi: Menambah atau menghapus moderator dengan penyimpanan permanen di database.
 * Sesuai arsitektur Baileys (Lightweight WhatsApp Bot)
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Inisialisasi struktur database jika belum ada
    if (!global.db.data.mods) global.db.data.mods = [];
    
    // 2. Menentukan target (dari tag, reply, atau input teks nomor)
    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    } else {
        who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
    }

    if (!who) {
        return m.reply(`❌ *Format Salah!*\n\n*Contoh:*\n• ${usedPrefix}${command} @user\n• ${usedPrefix}${command} 628xxxxx`);
    }

    let modNumber = who.split('@')[0];
    let isAdd = command.toLowerCase().startsWith('add');

    if (isAdd) {
        // --- LOGIKA TAMBAH MODERATOR ---
        if (global.db.data.mods.includes(modNumber)) {
            return m.reply(`⚠️ Nomor @${modNumber} sudah ada dalam list moderator.`);
        }

        // Tambah ke database (Penyimpanan Permanen)
        global.db.data.mods.push(modNumber);
        
        // Update variabel global runtime (Agar langsung aktif tanpa restart)
        if (!global.mods.includes(modNumber)) global.mods.push(modNumber);

        await conn.sendMessage(m.chat, {
            text: `✅ *BERHASIL DITAMBAHKAN*\n\nNomor @${modNumber} kini resmi menjadi moderator bot.`,
            mentions: [who]
        }, { quoted: m });

    } else {
        // --- LOGIKA HAPUS MODERATOR ---
        if (!global.db.data.mods.includes(modNumber)) {
            return m.reply(`❌ Nomor @${modNumber} tidak ditemukan dalam daftar moderator.`);
        }

        // Hapus dari database
        global.db.data.mods = global.db.data.mods.filter(v => v !== modNumber);
        
        // Update variabel global runtime
        global.mods = global.mods.filter(v => v !== modNumber);

        await conn.sendMessage(m.chat, {
            text: `🗑️ *BERHASIL DIHAPUS*\n\nNomor @${modNumber} telah dihapus dari jabatan moderator.`,
            mentions: [who]
        }, { quoted: m });
    }
}

// Metadata handler
handler.help = ['addmod', 'delmod'].map(v => v + ' <@tag/nomor>');
handler.tags = ['owner'];
// Command regex untuk menangkap addmod, addmoderator, delmod, dan removemod
handler.command = /^(addmod|addmoderator|delmod|delmoderator|removemod)$/i;

// Keamanan ketat
handler.owner = true;

module.exports = handler;