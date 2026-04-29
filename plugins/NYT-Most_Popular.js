/**
 * Plugin: NYT Most Popular
 * API: Most Popular API
 * Feature: Menampilkan artikel paling banyak dilihat berdasarkan periode hari.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Pilihan periode: 1 hari, 7 hari, 30 hari
    let period = args[0] || '1'; 
    if (!['1', '7', '30'].includes(period)) {
        return m.reply(`Periode tidak valid!\n\nPilih periode: *1, 7, atau 30* hari.\n*Contoh:* ${usedPrefix}${command} 7`);
    }

    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/mostpopular/v2/viewed/${period}.json?api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        
        let results = json.results.slice(0, 5);
        if (results.length === 0) throw 'Data populer tidak ditemukan.';

        let caption = `🔥 *NYT MOST POPULAR (${period} HARI TERAKHIR)*\n\n`;

        for (let i = 0; i < results.length; i++) {
            let item = results[i];
            caption += `*${i + 1}. ${item.title}*\n`;
            caption += `📅 ${item.published_date}\n`;
            caption += `📝 ${item.abstract}\n`;
            caption += `🔗 _${item.url}_\n\n`;
        }

        // Ekstrak gambar dari format Media Most Popular
        let firstImage = '';
        if (results[0].media && results[0].media.length > 0) {
            let mediaMetadata = results[0].media[0]['media-metadata'];
            if (mediaMetadata && mediaMetadata.length > 0) {
                firstImage = mediaMetadata[mediaMetadata.length - 1].url; // Ambil resolusi terbesar
            }
        }

        if (firstImage) {
            await conn.sendFile(m.chat, firstImage, 'nyt-popular.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT Popular Error:', e);
        m.reply(typeof e === 'string' ? e : (global.eror || 'Terjadi kesalahan sistem.'));
    }
};

handler.help = ['nytpopular <1|7|30>'];
handler.tags = ['news'];
handler.command = /^(nytpopular|nytp)$/i;
handler.limit = true;

module.exports = handler;