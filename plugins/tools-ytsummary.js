const ytsummary = require('../lib/youtube-summary');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!args[0]) {
        return m.reply(`Masukkan link YouTube yang ingin dirangkum!\n\n*Contoh:*\n${usedPrefix + command} https://youtu.be/xxxxxxx`);
    }

    let url = args[0];
    
    // Regex validasi link YouTube
    if (!url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/)) {
        return m.reply('Link YouTube tidak valid!');
    }

    // 2. Kirim pesan loading karena proses AI memakan waktu cukup lama
    m.reply(global.wait);

    try {
        // 3. Eksekusi Scraper
        let res = await ytsummary(url);

        if (!res || !res.success) {
            throw 'Gagal mendapatkan rangkuman video.';
        }

        // 4. Susun Format Pesan
        let caption = `*====[ YOUTUBE SUMMARY AI ]====*\n\n`;
        caption += `*» Judul :* ${res.title}\n`;
        caption += `*» Sumber :* YouTube\n\n`;
        caption += `*» Rangkuman:*\n${res.summary}\n\n`;
        caption += `${global.wm}`;

        // 5. Kirim balasan ke pengguna
        await conn.reply(m.chat, caption, m);

    } catch (e) {
        console.error("YTSummary Error:", e);
        // Tangkap pesan error dari throw Error di file scraper
        let errorMsg = e.message || e;
        m.reply(typeof errorMsg === 'string' ? `*Gagal:* ${errorMsg}` : global.eror);
    }
}

// Metadata Plugin
handler.help = ['ytsummary <link>', 'ytsum <link>'];
handler.tags = ['tools'];
handler.command = /^(ytsummary|ytsum)$/i;

// Pembatasan fitur
handler.limit = true; // Karena menggunakan AI LLM dengan token besar

module.exports = handler;