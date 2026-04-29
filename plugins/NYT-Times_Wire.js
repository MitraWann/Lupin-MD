/**
 * Plugin: NYT Times Wire
 * API: Times Wire API
 * Feature: Real-time feed artikel yang baru saja dipublikasikan.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let source = 'all'; // all, inyt, nyt
    let section = 'all'; // all, world, us, etc.
    
    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/news/v3/content/${source}/${section}.json?api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        
        let results = json.results.slice(0, 5);
        let caption = `⚡ *NYT REAL-TIME WIRE*\n_Berita yang baru saja di-publish detik ini_\n\n`;

        for (let i = 0; i < results.length; i++) {
            let item = results[i];
            caption += `*${i + 1}. ${item.title}*\n`;
            caption += `⏰ ${new Date(item.created_date).toLocaleString('id-ID')}\n`;
            caption += `📝 ${item.abstract}\n`;
            caption += `🔗 _${item.url}_\n\n`;
        }

        let firstImage = '';
        if (results[0].multimedia && results[0].multimedia.length > 0) {
            firstImage = results[0].multimedia[0].url;
        }

        if (firstImage) {
            await conn.sendFile(m.chat, firstImage, 'nyt-wire.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT Wire Error:', e);
        m.reply(typeof e === 'string' ? e : global.eror);
    }
};

handler.help = ['nytwire'];
handler.tags = ['news'];
handler.command = /^(nytwire|nytw)$/i;
handler.limit = true;

module.exports = handler;