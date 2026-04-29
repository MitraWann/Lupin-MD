/**
 * Plugin: NYT Top Stories
 * API: Top Stories API
 * Feature: Artikel unggulan saat ini dari berbagai seksi halaman utama.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const validSections = ['home', 'arts', 'science', 'us', 'world', 'business', 'technology'];
    let section = (args[0] || 'home').toLowerCase();

    if (!validSections.includes(section)) {
        return m.reply(`Seksi tidak valid!\n\n*Pilihan:* ${validSections.join(', ')}\n*Contoh:* ${usedPrefix}${command} technology`);
    }

    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        
        let results = json.results.slice(0, 5);
        
        let caption = `🌟 *NYT TOP STORIES - ${section.toUpperCase()}*\n\n`;

        for (let i = 0; i < results.length; i++) {
            let item = results[i];
            let pubDate = new Date(item.published_date).toLocaleString('id-ID');
            caption += `*${i + 1}. ${item.title}*\n`;
            caption += `📅 ${pubDate}\n`;
            caption += `📝 ${item.abstract || 'Tanpa ringkasan'}\n`;
            caption += `🔗 _${item.url}_\n\n`;
        }

        let firstImage = '';
        if (results[0].multimedia && results[0].multimedia.length > 0) {
            firstImage = results[0].multimedia[0].url;
        }

        if (firstImage) {
            await conn.sendFile(m.chat, firstImage, 'nyt-top.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT Top Stories Error:', e);
        m.reply(typeof e === 'string' ? e : global.eror);
    }
};

handler.help = ['nyttop <section>'];
handler.tags = ['news'];
handler.command = /^(nyttop|nyttopstories)$/i;
handler.limit = true;

module.exports = handler;