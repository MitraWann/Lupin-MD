let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Mengambil keranjang database pesan terjadwal
        let schedules = global.db.data.sendlater || [];

        // Jika kosong
        if (schedules.length === 0) {
            return m.reply('📭 *Tidak ada pesan terjadwal saat ini.*');
        }

        let txt = '📨 *DAFTAR ANTARA PESAN TERJADWAL* 📨\n\n';
        let mentions = [];

        // Looping untuk merakit teks
        schedules.forEach((p, index) => {
            let dateStr = new Date(p.waktu).toLocaleString("id-ID", { 
                timeZone: "Asia/Makassar", 
                dateStyle: "full", 
                timeStyle: "short" 
            });

            txt += `*${index + 1}.* Kepada: @${p.jid.split('@')[0]}\n`;
            txt += `   🕒 Waktu: ${dateStr} WITA\n`;
            txt += `   📝 Pesan: "${p.pesan}"\n\n`;
            
            // Menyimpan nomor target agar teks @mentions bisa berwarna biru dan bisa diklik
            mentions.push(p.jid); 
        });

        txt += `_Untuk membatalkan pengiriman, ketik:_\n*${usedPrefix}delsendlater <nomor>*`;

        // Kirim balasan dengan tag nomor target
        await conn.sendMessage(m.chat, { text: txt.trim(), mentions: mentions }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi error saat memuat daftar:\n${e.toString()}`);
    }
}

handler.help = ['listsendlater'];
handler.tags = ['asisten'];
// Bisa dipanggil pakai .listsendlater, .listpesan, atau .antreanpesan
handler.command = /^(listsendlater|listpesan|antreanpesan)$/i; 
handler.owner = true; // Khusus Owner

module.exports = handler;