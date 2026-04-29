const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Memanggil module videy.js (Pastikan path-nya sesuai dengan lokasi Anda menyimpan videy.js)
// Jika videy.js ada di folder plugins, ubah menjadi require('./videy')
const videy = require('../lib/videy'); 

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validasi Input: Memeriksa apakah user me-reply atau mengirim pesan media
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    // Jika tidak ada media video yang dikirim/direply
    if (!mime) throw `Kirim atau balas sebuah video dengan perintah *${usedPrefix + command}*`;
    
    // Memastikan format media adalah video
    if (!mime.includes('video')) throw `⚠️ Format *${mime}* tidak didukung! Perintah ini khusus untuk mengunggah video.`;

    // 2. Memberikan respon loading kepada pengguna
    await m.reply(global.wait);

    try {
        // 3. Mengunduh video menggunakan helper dari simple.js (bawaan Baileys)
        let media = await q.download();
        
        // 4. Menyimpan file sementara ke folder /tmp/ (agar bisa dibaca oleh fs.createReadStream di videy.js)
        let ext = mime.split('/')[1] || 'mp4';
        let tmpFile = path.join(process.cwd(), 'tmp', `${crypto.randomBytes(5).toString('hex')}.${ext}`);
        
        // Pastikan folder tmp ada
        if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'tmp'));
        }
        
        // Tulis buffer media ke file sementara
        fs.writeFileSync(tmpFile, media);

        // 5. Eksekusi pengunggahan ke Videy
        let res = await videy(tmpFile);
        
        // 6. Bersihkan file sementara setelah selesai (agar penyimpanan VPS/PC tidak penuh)
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

        // 7. Cek hasil dari module videy.js
        if (res.status === 'error') throw res.msg;

        // Mendapatkan ID/Url dari response videy
        // Videy biasanya mereturn JSON { id: 'xxxx' } pada r.data
        let videoId = res.output?.id;
        if (!videoId) throw 'Gagal mendapatkan ID video dari server Videy.';

        let url = `https://videy.co/v?id=${videoId}`;
        
        // 8. Format Caption Output
        let caption = `✅ *VIDEO BERHASIL DIUNGGAH*\n\n`;
        caption += `🔗 *Link URL:* ${url}\n`;
        caption += `🆔 *Video ID:* ${videoId}\n\n`;
        caption += `> _File Anda telah sukses dihosting di videy.co_`;

        await m.reply(caption);

    } catch (e) {
        console.error(e);
        m.reply(`${global.eror}\n\n*Terjadi Kesalahan:* ${e.message || e}`);
    }
}

handler.help = ['upvidey'];
handler.tags = ['tools', 'uploader'];
handler.command = /^(upvidey|uploadvidey|videyup|tourlvid)$/i;
handler.limit = true; // Karena proses upload video memakan resource

module.exports = handler;