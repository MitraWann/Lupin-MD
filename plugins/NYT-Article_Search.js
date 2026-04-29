/**
 * Plugin: NYT Article Search
 * API: Article Search API
 * Feature: Mencari artikel berdasarkan kata kunci dari seluruh database NYT.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan kata kunci pencarian!\n\n*Contoh:* ${usedPrefix}${command} artificial intelligence`);

    // Mengambil key dari global, dengan fallback
    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(text)}&api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        
        let docs = json.response.docs.slice(0, 5);
        if (docs.length === 0) throw 'Tidak ada artikel yang ditemukan untuk kata kunci tersebut.';

        let caption = `🔍 *NYT ARTICLE SEARCH*\n_Hasil pencarian untuk: "${text}"_\n\n`;

        for (let i = 0; i < docs.length; i++) {
            let item = docs[i];
            let pubDate = item.pub_date ? new Date(item.pub_date).toLocaleString('id-ID') : '-';
            
            caption += `*${i + 1}. ${item.headline.main}*\n`;
            caption += `📅 ${pubDate}\n`;
            caption += `📝 ${item.abstract ? item.abstract : 'Tanpa deskripsi.'}\n`;
            caption += `🔗 _${item.web_url}_\n\n`;
        }

        // Search API format gambar sedikit berbeda (butuh prefix domain NYT)
        let firstImage = '';
        if (docs[0].multimedia && docs[0].multimedia.length > 0) {
            let media = docs[0].multimedia.find(m => m.subtype === 'xlarge') || docs[0].multimedia[0];
            firstImage = `https://static01.nyt.com/${media.url}`;
        }

        if (firstImage) {
            await conn.sendFile(m.chat, firstImage, 'nyt-search.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT Search Error:', e);
        m.reply(typeof e === 'string' ? e : (global.eror || 'Terjadi kesalahan saat mencari artikel.'));
    }
};

handler.help = ['nytsearch <query>'];
handler.tags = ['news'];
handler.command = /^(nytsearch|nyts)$/i;
handler.limit = true;

module.exports = handler;