/**
 * PLUGIN TO-URL (CATBOX.MOE)
 * Deskripsi: Mengunggah media (gambar/video/stiker) ke Catbox.moe dan mengembalikan link publik.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validasi: Cek apakah ada media yang dikirim atau direply
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) return m.reply(`Kirim atau balas gambar/video/stiker dengan perintah *${usedPrefix + command}*`);

    m.reply('⏳ *Sedang mengunggah ke Catbox... Mohon tunggu.*');

    try {
        // 2. Download media dari WhatsApp
        let media = await q.download();
        if (!media) throw 'Gagal mendownload media.';

        // 3. Tentukan path sementara di folder /tmp
        let fileName = `${Date.now()}.${mime.split('/')[1]}`;
        let filePath = path.join(process.cwd(), 'tmp', fileName);

        // Pastikan folder tmp ada (biasanya sudah dibuat di index.js)
        if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
            fs.mkdirSync(path.join(process.cwd(), 'tmp'));
        }

        fs.writeFileSync(filePath, media);

        // 4. Logika Scraper Catbox (dari catbox.js anda)
        const uploadToCatbox = (pathFile) => {
            return new Promise((resolve, reject) => {
                const form = new FormData();
                form.append('fileToUpload', fs.createReadStream(pathFile));
                form.append('reqtype', 'fileupload');
                
                // Userhash bersifat opsional, bisa dikosongkan
                // form.append('userhash', 'your_hash_here');

                axios.post('https://catbox.moe/user/api.php', form, {
                    headers: {
                        ...form.getHeaders(),
                        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
                    },
                })
                .then(response => resolve(response.data))
                .catch(err => reject(err));
            });
        };

        // 5. Eksekusi upload
        let resultUrl = await uploadToCatbox(filePath);

        // 6. Kirim hasil ke pengguna
        let caption = `✅ *BERHASIL MENGUNGGAH*\n\n`;
        caption += `🔗 *URL:* ${resultUrl}\n`;
        caption += `📦 *Mime:* ${mime}\n`;
        caption += `📂 *Size:* ${(media.length / 1024).toFixed(2)} KB\n\n`;
        caption += `> File ini disimpan secara permanen di Catbox.moe`;

        await m.reply(caption);

        // 7. Housekeeping: Hapus file sementara agar tidak memenuhi disk
        fs.unlinkSync(filePath);

    } catch (e) {
        console.error(e);
        m.reply(`❌ *Gagal mengunggah:* ${e.message || e}`);
    }
}

handler.help = ['catbox']
handler.tags = ['tools']
handler.command = /^(catbox)$/i
handler.limit = true // Menggunakan limit agar tidak dispam

module.exports = handler;