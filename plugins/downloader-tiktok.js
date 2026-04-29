const { tiktokDl } = require('../lib/tiktok');

// Fungsi jeda untuk menghindari deteksi spam dari WhatsApp
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const url = text?.trim() || args[0];

    // Validasi Input URL
    if (!url) {
        return m.reply(
            `╭┈┈⬡「 🎵 *Tiktok Downloader* 」\n` +
            `┃ ㊗ Penggunaan: \`${usedPrefix + command} <url>\`\n` +
            `╰┈┈⬡\n\n` +
            `> Contoh: ${usedPrefix + command} https://vt.tiktok.com/xxx`
        );
    }

    // Validasi Regex URL TikTok
    if (!url.match(/tiktok\.com|vt\.tiktok|douyin/i)) {
        return m.reply('❌ URL tidak valid. Gunakan link TikTok.');
    }

    // Mengirim reaksi jam dan pesan loading dari config (global.wait)
    await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });
    await m.reply(global.wait);

    try {
        // Mengeksekusi scraper gabungan
        const result = await tiktokDl(url);
        
        // Membangun caption dari data scraper
        const caption = `✅ *Berhasil Diunduh*\n\n👤 *Author:* ${result.author}\n📝 *Deskripsi:* ${result.title}`;

        // ==========================================
        // 1. Logika Pengiriman Slides (Foto)
        // ==========================================
        if (result.images && result.images.length > 0) {
            await m.reply(`📸 *Mengirim ${result.images.length} slide foto...*`);
            
            for (let i = 0; i < result.images.length; i++) {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: { url: result.images[i] },
                        // Hanya berikan caption di slide pertama agar tidak menuh-menuhin chat
                        caption: i === 0 ? caption : '' 
                    },
                    { quoted: m }
                );
                await delay(1500); // Jeda anti-spam 1.5 detik per gambar
            }
        } 
        // ==========================================
        // 2. Logika Pengiriman Video
        // ==========================================
        else if (result.video) {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: result.video },
                    caption: caption,
                    mimetype: 'video/mp4'
                },
                { quoted: m }
            );
        }

        // ==========================================
        // 3. Logika Pengiriman Audio
        // ==========================================
        if (result.audio) {
            await delay(1000); // Jeda sejenak sebelum mengirim audio
            await conn.sendMessage(
                m.chat,
                {
                    audio: { url: result.audio },
                    mimetype: 'audio/mp4', // Baileys akan mengubah 'audio/mp4' menjadi Voice Note UI / Audio Player
                    fileName: `tiktok_audio.mp3`
                },
                { quoted: m }
            );
        }

        // Reaksi centang tanda selesai
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('[TikTokDL] Error:', err);
        
        // Reaksi silang tanda gagal dan memanggil pesan error dari config (global.eror)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`${global.eror}\n\n> ${err.message || err}`);
    }
};

handler.help = ['tiktok <url>'];
handler.tags = ['downloader'];
// Menyatukan command pemanggilan (tiktok, tt, tiktokdl, ttdl)
handler.command = /^(tiktok|tt|tiktokdl|ttdl)$/i;

// Mengurangi limit pengguna (karena di set `true`)
handler.limit = true;

module.exports = handler;