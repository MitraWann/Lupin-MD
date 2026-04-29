/**
 * Plugin: Anti Tag Status (Group)
 * Adapted for Baileys Base Framework
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Ambil data grup dari database global
    let chat = global.db.data.chats[m.chat];
    const action = args[0]?.toLowerCase();

    // 2. Menu Bantuan & Cek Status
    if (!action) {
        const status = chat.antitagsw === true ? 'on' : 'off';

        return m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ sᴇᴛᴛɪɴɢs*\n\n` +
            `> Status: *${status === 'on' ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `> Fitur ini menghapus pesan tag status\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
            `> \`${usedPrefix}${command} on\` → Aktifkan\n` +
            `> \`${usedPrefix}${command} off\` → Nonaktifkan`
        );
    }

    // 3. Logika untuk "Group ON"
    if (action === 'on') {
        chat.antitagsw = true;
        return m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status berhasil diaktifkan!\n` +
            `> Pesan tag status akan dihapus otomatis.`
        );
    }

    // 4. Logika untuk "Group OFF"
    if (action === 'off') {
        chat.antitagsw = false;
        return m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status berhasil dinonaktifkan.`
        );
    }

    // 5. Error Handling Input
    await m.reply(
        `❌ *ᴘɪʟɪʜᴀɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
        `> Gunakan: *on* atau *off*\n` +
        `> Contoh: \`${usedPrefix}${command} on\``
    );
};

// ==========================================
// EVENT INTERCEPTOR (Menangkap & Menghapus Status Tag)
// ==========================================
handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return false;
    
    let chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antitagsw) return false;

    // Mendeteksi apakah pesan merupakan 'groupStatusMentionMessage'
    let isStatusMention = false;
    if (m.message) {
        const messageKeys = Object.keys(m.message);
        if (messageKeys.includes('groupStatusMentionMessage')) {
            isStatusMention = true;
        }
    }

    if (isStatusMention) {
        // Abaikan jika yang mengirim adalah Admin Grup (Opsional, tapi direkomendasikan)
        if (isAdmin) return false;
        
        // Bot harus menjadi admin untuk dapat menghapus pesan orang lain
        if (!isBotAdmin) return false; 

        // Eksekusi penghapusan pesan (Tarik pesan)
        await conn.sendMessage(m.chat, { delete: m.key });
        return true;
    }

    return false;
};

// ==========================================
// METADATA PLUGIN
// ==========================================
handler.help = ['antitagsw'].map(v => v + ' <on/off>');
handler.tags = ['group'];
handler.command = /^(antitagsw|antitag|antistatustag)$/i;

handler.group = true;      // Fitur ini hanya jalan di Grup
handler.admin = true;      // Hanya admin yang bisa mengaktifkan/mematikan
handler.botAdmin = true;   // Bot wajib admin agar bisa menghapus pesan

module.exports = handler;