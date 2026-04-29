/**
 * Plugin: NYT Best Sellers
 * API: Books API
 * Feature: Menampilkan daftar buku Best Seller dari NYT.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let list = args[0] ? args.join('-').toLowerCase() : 'hardcover-fiction';

    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        if (!json.results || !json.results.books) throw `Kategori buku "${list}" tidak ditemukan.\nCoba: *hardcover-fiction* atau *e-book-fiction*`;
        
        let books = json.results.books.slice(0, 5);
        let caption = `📚 *NYT BEST SELLERS: ${json.results.list_name}*\n\n`;

        for (let i = 0; i < books.length; i++) {
            let book = books[i];
            caption += `*${book.rank}. ${book.title}*\n`;
            caption += `✍️ _Penulis: ${book.author}_\n`;
            caption += `🏢 _Penerbit: ${book.publisher}_\n`;
            caption += `📝 ${book.description}\n`;
            caption += `🛒 _Amazon: ${book.amazon_product_url}_\n\n`;
        }

        let coverImage = books[0].book_image;

        if (coverImage) {
            await conn.sendFile(m.chat, coverImage, 'book.jpg', caption.trim(), m);
        } else {
            await m.reply(caption.trim());
        }

    } catch (e) {
        console.error('NYT Books Error:', e);
        m.reply(typeof e === 'string' ? e : global.eror);
    }
};

handler.help = ['nytbooks <kategori>'];
handler.tags = ['news'];
handler.command = /^(nytbooks|nytb)$/i;
handler.limit = true;

module.exports = handler;