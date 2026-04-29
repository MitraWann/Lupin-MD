let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Validasi apakah user melakukan reply ke pesan
    if (!m.quoted) return m.reply(
        `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
        `> Reply pesan yang ingin di-pin!\n\n` +
        `*Cara penggunaan:*\n` +
        `> Reply pesan → ketik \`${usedPrefix + command}\`\n` +
        `> Optional: \`${usedPrefix + command} 24\` (pin 24 jam)\n` +
        `> Optional: \`${usedPrefix + command} 7h\` (pin 7 hari)\n` +
        `> Optional: \`${usedPrefix + command} 30h\` (pin 30 hari)`
    );

    // 2. Tentukan durasi (default 24 jam = 86400 detik)
    let duration = 2592000;
    let durationText = "30 Hari";

    if (args && args.length > 0) {
        let input = args[0].toLowerCase();
        
        // Deteksi input spesifik standar WhatsApp
        if (input === '7h' || input === '7') {
            duration = 604800; // 7 Hari
            durationText = "7 hari";
        } else if (input === '30h' || input === '30') {
            duration = 2592000; // 30 Hari
            durationText = "30 hari";
        } else if (input === '24j' || input === '24') {
            duration = 86400; // 24 Jam
            durationText = "24 jam";
        } else {
            // Deteksi input angka kustom
            let num = parseInt(input);
            if (!isNaN(num) && num > 0) {
                if (input.includes('h') || input.includes('d')) { 
                    duration = num * 86400; // Konversi hari ke detik
                    durationText = `${num} hari`;
                } else { 
                    duration = num * 3600; // Konversi jam ke detik
                    durationText = `${num} jam`;
                }
            }
        }
    }

    try {
        // 3. Susun kunci pesan yang akan di-pin
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        // 4. Kirim perintah Pin ke WhatsApp
        await conn.sendMessage(m.chat, {
            pin: pinKey,
            type: 1, // 1 untuk Pin, 2 untuk Unpin
            time: duration
        });

        // 5. Ekstraksi Tag Orisinal (Regex Bawaan yang Paling Stabil)
        let tag = `@${m.sender.replace(/@.+/, '')}`;

        const successMsg = `📌 *ᴘᴇsᴀɴ ᴅɪᴘɪɴ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📡 sᴛᴀᴛᴜs: *🟢 Berhasil*\n` +
            `┃ ⏱️ ᴅᴜʀᴀsɪ: *${durationText}*\n` +
            `┃ 👤 ʙʏ: ${tag}\n` +
            `╰┈┈⬡\n\n` +
            `> _Pesan berhasil di-pin di grup ini._`;

        // 6. Eksekusi pesan dengan Mention System Orisinal
        await conn.sendMessage(m.chat, {
            text: successMsg,
            mentions: [m.sender],
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m });

    } catch (error) {
        console.error(error);
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Gagal mem-pin pesan. Pastikan bot adalah admin.`);
    }
};

handler.help = ['pinpesan (reply)'];
handler.tags = ['group'];
handler.command = /^(sematkan|semat|pinmsg|pinpesan|pin)$/i;

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;