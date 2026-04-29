/**
 * Plugin: Daftar Moderator
 * Deskripsi: Melihat daftar moderator resmi bot dari database.
 * Sesuai arsitektur Baileys (Lightweight WhatsApp Bot)
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    // Mengambil data moderator dari database persistent
    // Jika belum ada di database, fallback ke global.mods (runtime)
    let mods = global.db.data.mods || global.mods || [];

    if (mods.length === 0) {
        return m.reply('❌ Belum ada moderator yang terdaftar dalam sistem bot ini.');
    }

    let teks = `🛡️ *DAFTAR MODERATOR* 🛡️\n`;
    teks += `Berikut adalah daftar moderator pada sistem bot ini:\n\n`;

    // Memformat nomor menjadi list dengan mention
    mods.forEach((v, i) => {
        // Membersihkan format nomor jika ada karakter non-digit
        let jid = v.replace(/[^0-9]/g, '');
        teks += ` ${i + 1}. @${jid}\n`;
    });

    teks += `\n_ℹ️ Silakan hubungi moderator jika ada kendala, request fitur, atau melaporkan bug._`;

    // Menyiapkan JID untuk fitur mention di WhatsApp
    let mentionsData = mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');

    await conn.sendMessage(m.chat, {
        text: teks,
        mentions: mentionsData
    }, { quoted: m });
}

// Metadata handler
handler.help = ['moderator', 'listmod'];
handler.tags = ['info'];
handler.command = /^(moderator|listmod|modlist|listmoderator)$/i;

module.exports = handler;