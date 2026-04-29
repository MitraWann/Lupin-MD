let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validasi apakah user melakukan reply ke pesan yang sudah di-pin
    if (!m.quoted) return m.reply(`⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n> Reply pesan yang ingin dilepas sematannya!\n\n*Cara penggunaan:*\n> Reply pesan tersemat → ketik \`${usedPrefix + command}\``);

    try {
        // 2. Susun kunci pesan yang akan di-unpin (sama seperti saat mem-pin)
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        // 3. Kirim perintah Unpin ke WhatsApp
        await conn.sendMessage(m.chat, {
            pin: pinKey,
            type: 2 // type: 2 digunakan untuk Unpin (melepas sematan)
        });

        // ==========================================
        // PERBAIKAN 1: FORMAT TAG YANG PRESISI
        // ==========================================
        let tag = `@${m.sender.replace(/@.+/, '')}`;

        // 4. Kirim notifikasi berhasil
        const successMsg = `📌 *sᴇᴍᴀᴛᴀɴ ᴅɪʟᴇᴘᴀs*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📡 sᴛᴀᴛᴜs: *⚪ Berhasil Unpin*\n` +
            `┃ 👤 ʙʏ: ${tag}\n` +
            `╰┈┈⬡\n\n` +
            `> _Pesan berhasil dilepas dari sematan grup._`;

        // ==========================================
        // PERBAIKAN 2: JURUS BOM TAG PADA SENDMESSAGE
        // ==========================================
        await conn.sendMessage(m.chat, {
            text: successMsg,
            mentions: [m.sender],
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Gagal melepas sematan pesan. Pastikan pesan tersebut memang sedang di-pin dan bot adalah admin.`);
    }
};

handler.help = ['unpinpesan (reply)'];
handler.tags = ['group'];
handler.command = /^(lepassematan|unpin|unpinmsg|unpinpesan)$/i;

// Fitur keamanan tambahan (Hanya untuk Admin & Grup)
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;