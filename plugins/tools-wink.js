const fs = require('fs');
const path = require('path');
const os = require('os');
const { WinkClient, TASK } = require('../lib/wink');

let handler = async (m, { conn, usedPrefix, command, args }) => {
    // Mengecek apakah user mengirim/mereply pesan gambar
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime.includes('image')) {
        return m.reply(`Kirim atau balas gambar dengan caption *${usedPrefix + command}*\n\n*Catatan:*\nTambahkan argumen *ultra* untuk mode Ultra HD\nContoh: *${usedPrefix + command} ultra*`);
    }

    // Mengirim pesan indikator loading
    m.reply(global.wait);

    let tmpPath;
    try {
        // 1. Download gambar media dari WhatsApp ke buffer
        let media = await q.download();
        
        // 2. Simpan sementara ke system temp folder (karena scraper butuh input filepath)
        let ext = mime.split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        tmpPath = path.join(os.tmpdir(), `wink_${Date.now()}.${ext}`);
        fs.writeFileSync(tmpPath, media);

        // 3. Inisialisasi API Scraper (WinkClient)
        // Kita menggunakan temp folder sistem untuk outputDir agar otomatis bersih
        const client = new WinkClient({ outputDir: os.tmpdir() });
        
        // 4. Deteksi apakah user meminta Ultra HD (defaultnya HD)
        let selectedTask = (args[0] && args[0].toLowerCase() === 'ultra') ? TASK.ULTRA_HD : TASK.HD;

        // 5. Eksekusi proses enhancement gambar
        await client.init();
        const upload = await client.uploadFile(tmpPath);
        const task = await client.submitTask(upload, selectedTask);
        const result = await client.waitForResult(task);

        // 6. Ambil URL output gambar
        let resultUrl = result.media.url;

        if (!resultUrl) throw new Error('Gagal mendapatkan URL gambar hasil dari server.');

        // 7. Format deskripsi hasil
        let capt = `*WINK AI - ENHANCER*\n\n`;
        capt += `✨ *Tipe*: ${selectedTask.label}\n`;
        capt += `📉 *Resolusi Awal*: ${result.media.oriWidth} x ${result.media.oriHeight}\n`;
        capt += `📈 *Resolusi Baru*: ${result.media.width} x ${result.media.height}\n`;
        capt += `⏱️ *Waktu Proses*: ${(result.performance.totalPollMs / 1000).toFixed(1)} detik\n`;
        
        // 8. Kirim kembali gambar HD via URL (menghemat space server tanpa download 2x)
        await conn.sendFile(m.chat, resultUrl, 'hd_result.jpg', capt, m);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi kesalahan sistem saat memproses gambar!\nLog: ${e.message || e}\n\n${global.eror}`);
    } finally {
        // 9. Bersihkan file sampah / temporary image
        if (tmpPath && fs.existsSync(tmpPath)) {
            fs.unlinkSync(tmpPath);
        }
    }
};

handler.help = ['wink','hd'];
handler.tags = ['tools'];
handler.command = /^(wink|hd)$/i;

// Karena AI processing butuh resource, aktifkan limit (potong limit user)
handler.limit = true; 

module.exports = handler;