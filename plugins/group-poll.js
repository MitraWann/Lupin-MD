let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Format tidak valid!\n\n` +
            `*Format:*\n` +
            `> \`${usedPrefix + command} pertanyaan | opsi1, opsi2, opsi3\`\n\n` +
            `*Contoh:*\n` +
            `> \`${usedPrefix + command} Makan siang apa? | Nasi Goreng, Mie Ayam, Bakso\`\n\n` +
            `*Opsi tambahan:*\n` +
            `> \`${usedPrefix + command} multi | pertanyaan | opsi1, opsi2\`\n` +
            `> (untuk pilihan ganda)`
        );
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        return m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Format: \`pertanyaan | opsi1, opsi2, ...\``
        );
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) return m.reply(`⚠️ *Minimal 2 opsi pilihan!*`);
    if (options.length > 12) return m.reply(`⚠️ *Maksimal 12 opsi pilihan!*`);
    if (question.length > 255) return m.reply(`⚠️ *Pertanyaan terlalu panjang! (Maks 255 karakter)*`);
    
    try {
        // ==========================================
        // PERBAIKAN 1: FORMAT TAG YANG PRESISI
        // ==========================================
        let tag = `@${m.sender.replace(/@.+/, '')}`;

        const pollMsg = `📊 *ᴘᴏʟʟ ᴅɪʙᴜᴀᴛ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ ❓ ᴘᴇʀᴛᴀɴʏᴀᴀɴ: *${question}*\n` +
            `┃ 📝 ᴏᴘsɪ: *${options.length} pilihan*\n` +
            `┃ 🔢 ᴛɪᴘᴇ: *${isMultiple ? 'Pilihan Ganda' : 'Pilihan Tunggal'}*\n` +
            `┃ 👤 ʙʏ: ${tag}\n` +
            `╰┈┈⬡\n\n` +
            `> _Silakan vote di bawah ini!_`;
        
        // ==========================================
        // PERBAIKAN 2: JURUS BOM TAG PADA SENDMESSAGE
        // ==========================================
        await conn.sendMessage(m.chat, { 
            text: pollMsg, 
            mentions: [m.sender],
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m });
        
        // Kirim fitur Poll asli WhatsApp
        await conn.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
    } catch (error) {
        console.error(error);
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Gagal membuat poll.`);
    }
};

handler.help = ['poll <pertanyaan> | <opsi>'];
handler.tags = ['group'];
handler.command = /^(poll|voting|vote|survei)$/i;
handler.group = true; 

module.exports = handler;