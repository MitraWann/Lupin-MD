const { tiktokScraper } = require('../lib/jagung');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) return m.reply(`Masukkan URL TikTok yang ingin diunduh!\n\nContoh:\n${usedPrefix + command} https://www.tiktok.com/@maksimstefanov4/photo/7621166300668185878`);
    if (!/tiktok\.com/i.test(text)) return m.reply(`URL tidak valid! Pastikan link tersebut berasal dari domain TikTok.`);

    // 2. Loading Simulasi (menggunakan global variabel config.js)
    m.reply(global.wait);

    try {
        // 3. Eksekusi Scraper
        const res = await tiktokScraper(text);
        if (!res) return m.reply(global.eror);

        // 4. Menyusun Format Teks UX
        let caption = `乂  *T I K T O K - D O W N L O A D E R*\n\n`;
        caption += `👤 *Author:* ${res.author.nickname} (@${res.author.username})\n`;
        caption += `📝 *Deskripsi:* ${res.title ? res.title : '-'}\n`;
        caption += `❤️ *Likes:* ${res.like.toLocaleString()} | 💬 *Comments:* ${res.comment.toLocaleString()}\n`;
        caption += `🔁 *Shares:* ${res.share.toLocaleString()} | 👁️ *Views:* ${res.views.toLocaleString()}\n`;
        caption += `🎵 *Music:* ${res.music.title || 'Original Sound'} - ${res.music.author || 'Unknown'}\n`;

        // 5. Logic Pengiriman (Video vs Image Slide)
        if (res.isVideo) {
            // Jika konten berupa Video
            await conn.sendMessage(m.chat, { 
                video: { url: res.download }, 
                caption: caption 
            }, { quoted: m });
        } else {
            // Jika konten berupa Image Post (Slide)
            if (Array.isArray(res.download) && res.download.length > 0) {
                await m.reply(caption + `\n\n_Mendownload ${res.download.length} gambar slide, mohon tunggu sebentar..._`);
                
                for (let i = 0; i < res.download.length; i++) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: res.download[i] } 
                    }, { quoted: m });
                    // Delay 1.5 detik per gambar untuk menghindari pemblokiran Anti-Spam WA
                    await new Promise(resolve => setTimeout(resolve, 1500)); 
                }
            } else {
                return m.reply(global.eror);
            }
        }

        // 6. Ekstraksi dan Pengiriman Audio (Tambahan UX Premium)
        if (res.music && res.music.url) {
            await conn.sendMessage(m.chat, {
                audio: { url: res.music.url },
                mimetype: 'audio/mp4',
                ptt: false // Jadikan true jika ingin dikirim sebagai Voice Note (VN)
            }, { quoted: m });
        }

    } catch (error) {
        console.error(error);
        m.reply(global.eror);
    }
}

// Konfigurasi Handler
handler.help = ['jagung <url>']
handler.tags = ['downloader']
handler.command = /^(jagung)$/i

// Keamanan & Ekonomi Bot
handler.limit = true // Mengurangi saldo/limit user untuk mengontrol penggunaan

module.exports = handler;