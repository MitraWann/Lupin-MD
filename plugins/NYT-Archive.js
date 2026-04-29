/**
 * Plugin: NYT Archive
 * API: Archive API
 * Feature: Mengambil data arsip artikel berdasarkan bulan & tahun.
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (args.length < 2) {
        return m.reply(`Masukkan Tahun dan Bulan!\n\n*Contoh:* ${usedPrefix}${command} 2024 1\n_(Untuk melihat arsip bulan Januari 2024)_`);
    }

    let year = args[0];
    let month = args[1];

    const apiKey = global.nytApiKey || 'a7mMCVwS0o40SUo3aqWkDxTAfL51vI7XYsCAAKBSx9uRbAUG';
    let apiUrl = `https://api.nytimes.com/svc/archive/v1/${year}/${month}.json?api-key=${apiKey}`;

    await m.reply(global.wait);

    try {
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.fault) throw json.fault.faultstring;
        
        // Archive API mengembalikan ribuan data, kita acak dan ambil 5
        let allDocs = json.response.docs;
        if (allDocs.length === 0) throw 'Arsip tidak ditemukan pada tanggal tersebut.';

        let randomDocs = allDocs.sort(() => 0.5 - Math.random()).slice(0, 5);
        let caption = `🗄️ *NYT ARCHIVE (${month}-${year})*\n_Menampilkan 5 arsip secara acak dari total ${allDocs.length} artikel_\n\n`;

        for (let i = 0; i < randomDocs.length; i++) {
            let item = randomDocs[i];
            caption += `*${i + 1}. ${item.headline.main}*\n`;
            caption += `📅 ${new Date(item.pub_date).toLocaleDateString('id-ID')}\n`;
            caption += `🔗 _${item.web_url}_\n\n`;
        }

        await m.reply(caption.trim()); // Tanpa gambar karena arsip lama sering tidak memiliki gambar

    } catch (e) {
        console.error('NYT Archive Error:', e);
        m.reply(typeof e === 'string' ? e : global.eror);
    }
};

handler.help = ['nytarchive <tahun> <bulan>'];
handler.tags = ['news'];
handler.command = /^(nytarchive|nyta)$/i;
handler.limit = true;

module.exports = handler;