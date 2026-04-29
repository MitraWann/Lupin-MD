// Import Scraper dari direktori lib
const { igStalk } = require('../lib/scraper-igstalk');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input Parameter
    if (!text) {
        return m.reply(`🚩 Masukkan username Instagram yang ingin di-stalk!\n\n*Contoh:* ${usedPrefix + command} mitrawann`);
    }

    // 2. Kirim pesan loading dari config global
    m.reply(global.wait);

    try {
        // 3. Eksekusi Scraper eksternal dari folder lib
        let data = await igStalk(text);

        // 4. Formatting output menggunakan data API
        let caption = `*[ INSTAGRAM STALKER ]*\n\n`;
        caption += `👤 *Username:* ${data.username}\n`;
        caption += `📝 *Nama Lengkap:* ${data.full_name || '-'}\n`;
        caption += `✅ *Terverifikasi:* ${data.is_verified ? 'Iya (Centang Biru)' : 'Tidak'}\n`;
        caption += `🔒 *Akun Private:* ${data.is_private ? 'Iya' : 'Tidak'}\n`;
        caption += `👥 *Pengikut:* ${Number(data.follower_count).toLocaleString('id-ID')}\n`;
        caption += `🫂 *Diikuti:* ${Number(data.following_count).toLocaleString('id-ID')}\n`;
        caption += `🖼️ *Total Postingan:* ${Number(data.media_count).toLocaleString('id-ID')}\n\n`;
        caption += `📄 *Biografi:*\n${data.biography ? data.biography : 'Tidak ada bio'}\n\n`;

        // 5. Ekstraksi URL Gambar (Prioritas HD jika tersedia)
        let profileImage = data.profile_pic_url_hd || data.profile_pic_url;

        // 6. Kirim Gambar beserta caption ke pengguna
        await conn.sendFile(m.chat, profileImage, 'ig_profile.jpg', caption, m);

    } catch (e) {
        // 7. Penanganan Error (Fallback ke global.eror jika terjadi kegagalan)
        console.error(e);
        m.reply(`${global.eror}\n\nTerjadi kesalahan, pastikan username benar atau coba beberapa saat lagi.`);
    }
}

// Konfigurasi Command Modular
handler.help = ['igstalk <username>']
handler.tags = ['internet']
handler.command = /^(igstalk|igs|stalkig)$/i

// Flag Keamanan & Ekonomi
handler.limit = true // Memotong limit user sesuai config handler Anda
handler.group = false 

module.exports = handler;