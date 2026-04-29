/**
 * Plugin: NYT RSS Feed
 * API: NYT RSS Section Feeds
 * Feature: Menguraikan format XML RSS NYT menggunakan layanan converter public.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let section = args[0] ? args[0].toLowerCase() : 'HomePage';
    
    // RSS Feed menggunakan format XML, tidak memerlukan API key, 
    // tapi kita convert ke JSON dengan rss2json API gratis
    let rssUrl = `https://rss.nytimes.com/services/xml/rss/nyt/${section}.xml`;
    let apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.status !== 'ok') throw `RSS untuk seksi "${section}" tidak ditemukan.\nCoba: *World, Technology, Business*`;
        
        let items = json.items.slice(0, 5);
        let caption = `📡 *NYT RSS FEED: ${json.feed.title}*\n\n`;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            caption += `*${i + 1}. ${item.title}*\n`;
            caption += `📅 ${item.pubDate}\n`;
            caption += `🔗 _${item.link}_\n\n`;
        }

        let firstImage = items[0].enclosure?.link || items[0].thumbnail;

        if (firstImage && firstImage.startsWith('http')) {
            await conn.sendFile(m.chat, firstImage, 'nyt-rss.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT RSS Error:', e);
        m.reply(typeof e === 'string' ? e : global.eror);
    }
};

handler.help = ['nytrss <section>'];
handler.tags = ['news'];
handler.command = /^(nytrss|nytr)$/i;
handler.limit = true;

module.exports = handler;