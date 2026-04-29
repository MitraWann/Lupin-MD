/**
 * Nama Plugin: Set Background Profil
 * Deskripsi: Mengatur custom banner/background profil pengguna ke dalam database.
 * Author: Senior Bot Developer
 */

// Gunakan library upload bawaan struktur bot (mengunggah ke telegra.ph)
const uploadImage = require('../lib/uploadImage') // Sesuaikan path jika nama library/path berbeda

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Menangkap pesan berupa gambar (langsung atau via reply pesan)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    // 2. Validasi File (Hanya Menerima Gambar)
    if (!/image/.test(mime)) {
        return m.reply(`Kirim atau reply sebuah gambar dengan caption *${usedPrefix + command}*\n\n*🖼️ Tips Resolusi Optimal:*\nUntuk hasil banner terbaik, proporsional, dan tidak buram, gunakan gambar lanskap (melebar) dengan ukuran presisi *1080 x 480 piksel*.`);
    }

    m.reply(global.wait);

    try {
        // 3. Download buffer gambar dari WhatsApp
        let media = await q.download();
        
        // 4. Upload gambar ke internet (via helper) agar menghemat storage server
        let link = await uploadImage(media);

        // 5. Simpan URL tersebut ke dalam database pengguna
        let user = global.db.data.users[m.sender];
        
        // Membuat property baru 'profilebg' di database pengguna jika belum ada
        user.profilebg = link;

        // 6. Kirim konfirmasi berhasil
        m.reply(`✅ *Banner Profil Berhasil Diperbarui!*\n\nBackground kustom Anda telah disimpan. Silakan ketik *${usedPrefix}profile* untuk melihat hasilnya.\n\n_(Catatan: Bot akan menyesuaikan gambar otomatis jika ukuran tidak tepat 1080x480 px)_`);

    } catch (e) {
        console.error("SetBG Error:", e);
        m.reply(`${global.eror} Gagal menyimpan background. Pastikan ukuran gambar tidak terlalu besar atau coba beberapa saat lagi.`);
    }
}

handler.help = ['setbgprofile', 'setbg'];
handler.tags = ['main'];
handler.command = /^(setbgprofile|setbg)$/i;
handler.limit = false; // Karena menggunakan fitur upload, berikan batasan limit

module.exports = handler;