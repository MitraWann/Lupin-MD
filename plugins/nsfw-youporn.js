const yp = require('../lib/youporn');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Pengecekan apakah chat saat ini mengizinkan fitur NSFW
    if (!global.db.data.chats[m.chat].nsfw) return m.reply(global.dfail('nsfw', m, conn));
    if (!text) return m.reply(`*Format salah!*\n\nGunakan: _${usedPrefix + command} query_\nContoh: _${usedPrefix + command} stepmother_`);

    await m.reply(global.wait);

    try {
        // Step 1: Search
        let results = await yp.search(text);
        if (results.length === 0) return m.reply('_Video tidak ditemukan._');

        // Mengambil hasil pertama untuk didownload secara otomatis
        let target = results[0];
        
        // Step 2: Get Media Link
        let videoData = await yp.getVideo(target.link);
        if (!videoData || !videoData.videoUrl) return m.reply('_Gagal mengambil link download._');

        let caption = `
🎬 *YOUPORN DOWNLOADER*

📌 *Title:* ${target.title}
👀 *Views:* ${target.views}
👍 *Rating:* ${target.rating}
⚙️ *Quality:* ${videoData.quality}p
🔗 *Source:* ${target.link}

${global.wm}`.trim();

        // Step 3: Send File
        await conn.sendFile(m.chat, videoData.videoUrl, 'youporn.mp4', caption, m, false, {
            mentions: [m.sender]
        });

    } catch (e) {
        console.error(e);
        m.reply(global.eror);
    }
};

handler.help = ['youporn'];
handler.tags = ['nsfw'];
handler.command = /^(youporn|yp|ypdl)$/i;

// Menggunakan sistem limit & nsfw dari handler.js
handler.limit = true;
handler.nsfw = true;

module.exports = handler;