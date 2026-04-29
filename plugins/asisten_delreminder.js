let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];

        // 1. Pengecekan keranjang pengingat
        if (!user || !user.pengingat || user.pengingat.length === 0) {
            return m.reply('📭 Kamu tidak memiliki pengingat jadwal yang aktif saat ini.');
        }

        // 2. Memastikan pengguna memasukkan nomor yang ingin dihapus
        if (!text) {
            return m.reply(`Masukkan nomor urut pengingat yang ingin dihapus!\n\n*Contoh:*\n${usedPrefix + command} 1\n\n_Ketik *${usedPrefix}listreminder* untuk melihat nomor urutnya._`);
        }

        // Mengubah input menjadi format angka murni
        let n = parseInt(text);

        // 3. Validasi Angka (Mencegah error jika huruf atau nomor tidak ada)
        if (isNaN(n) || n < 1 || n > user.pengingat.length) {
            return m.reply(`⚠️ Nomor pengingat tidak ditemukan!\nPastikan memasukkan angka yang benar antara 1 sampai ${user.pengingat.length}.`);
        }

        // 4. Proses Eksekusi Hapus (Index array selalu dikurangi 1)
        let index = n - 1;
        let pesanDihapus = user.pengingat[index].pesan; // Menyimpan nama pesan untuk laporan

        // Fungsi .splice(index, 1) akan membuang 1 data persis di urutan index tersebut
        // dan otomatis merapatkan kembali urutan array sisanya.
        user.pengingat.splice(index, 1);

        // 5. Laporan Berhasil
        m.reply(`✅ *Pengingat Berhasil Dihapus!*\n\n📝 *Pesan:* ${pesanDihapus}\n\n_Pengingat ini telah dibatalkan dan tidak akan dikirim._`);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi error saat menghapus pengingat:\n${e.toString()}`);
    }
}

handler.help = ['delreminder <nomor>'];
handler.tags = ['asisten'];
// Bisa dipanggil pakai .delreminder, .hapusreminder, atau .delpengingat
handler.command = /^(delreminder|delpengingat|hapusreminder)$/i; 
handler.owner = true; // Khusus Owner

module.exports = handler;