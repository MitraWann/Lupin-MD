let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let schedules = global.db.data.sendlater || [];

        if (schedules.length === 0) {
            return m.reply('📭 *Tidak ada pesan terjadwal yang bisa dihapus.*');
        }

        if (!text) {
            return m.reply(`⚠️ Masukkan nomor urut pesan yang ingin dibatalkan!\n\n*Contoh:*\n${usedPrefix + command} 1\n\n_Ketik *${usedPrefix}listsendlater* untuk melihat nomor urutnya._`);
        }

        let n = parseInt(text);

        // Validasi jika input bukan angka atau angkanya melebihi jumlah daftar
        if (isNaN(n) || n < 1 || n > schedules.length) {
            return m.reply(`⚠️ Nomor tidak valid! Masukkan angka antara 1 sampai ${schedules.length}.`);
        }

        let index = n - 1;
        let target = schedules[index]; // Mengambil data pesan yang akan dihapus untuk laporan
        
        // Mengeksekusi penghapusan dari database
        schedules.splice(index, 1);

        // Laporan berhasil dibatalkan
        let laporan = `✅ *Pesan Terjadwal Berhasil Dibatalkan!*\n\n👤 Target: @${target.jid.split('@')[0]}\n📝 Pesan: "${target.pesan}"\n\n_Pesan ini telah dihapus dari antrean dan tidak akan dikirimkan._`;
        
        await conn.sendMessage(m.chat, { text: laporan, mentions: [target.jid] }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi error saat membatalkan pesan:\n${e.toString()}`);
    }
}

handler.help = ['delsendlater <nomor>'];
handler.tags = ['asisten'];
// Bisa dipanggil pakai .delsendlater, .hapuspesan, atau .batalpesan
handler.command = /^(delsendlater|hapuspesan|batalpesan)$/i; 
handler.owner = true; // Khusus Owner

module.exports = handler;