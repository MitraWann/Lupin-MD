/**
 * THREADS DOWNLOADER PLUGIN
 * Fitur: Mengunduh video/foto dari Threads menggunakan API NexRay
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Validasi input URL
    if (!args[0]) {
        return m.reply(`*Format salah!*\n\nContoh: \n${usedPrefix}${command} https://www.threads.net/@user/post/xxx`);
    }

    // Cek apakah URL valid Threads
    if (!args[0].match(/threads\.(com|net)/gi)) {
        return m.reply('⚠️ URL yang Anda berikan bukan dari Threads!');
    }

    // Tampilkan pesan loading
    await m.reply(global.wait || '⏳ Sedang memproses permintaan Anda...');

    try {
        // Fetch data dari API NexRay
        const apiUrl = `https://api.nexray.web.id/downloader/threads?url=${encodeURIComponent(args[0])}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Cek status keberhasilan API
        if (!data.status || !data.result) {
            throw 'Gagal mendapatkan data dari server.';
        }

        const { title, media, author: profile } = data.result;

        // Siapkan caption informasi pengunggah
        let caption = `🎬 *THREADS DOWNLOADER*`;
        
        // Kirim media (mendukung multi-media)
        if (media && media.length > 0) {
            for (let i = 0; i < media.length; i++) {
                const item = media[i];
                // Kirim media pertama dengan caption, sisanya tanpa caption
                const finalCaption = i === 0 ? caption : '';
                
                await conn.sendFile(
                    m.chat, 
                    item.url, 
                    '', 
                    finalCaption, 
                    m
                );

                // Jeda singkat antar pengiriman jika multi-media untuk menghindari spam
                if (media.length > 1) await new Promise(resolve => setTimeout(resolve, 1500));
            }
        } else {
            m.reply('❌ Tidak ada media yang ditemukan pada postingan tersebut.');
        }

    } catch (e) {
        console.error('Threads Downloader Error:', e);
        m.reply(global.eror || `❌ Terjadi kesalahan saat mengunduh: ${e.message || e}`);
    }
};

handler.help = ['threads'].map(v => v + ' <url>');
handler.tags = ['downloader'];
handler.command = /^(threads)$/i;
handler.limit = true; // Menggunakan limit agar tidak disalahgunakan

module.exports = handler;