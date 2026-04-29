let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    
    if (!user || !user.pengingat || user.pengingat.length === 0) {
        return m.reply('*Kamu tidak memiliki jadwal pengingat saat ini.*');
    }

    let pengingat = user.pengingat;

    // Mengurutkan jadwal dari waktu yang paling dekat ke yang paling jauh
    pengingat.sort((a, b) => a.waktu - b.waktu);

    let txt = '*DAFTAR PENGINGAT (REMINDER)*\n\n';
    let now = Date.now();

    pengingat.forEach((p, index) => {
        let tzOpt = { timeZone: "Asia/Makassar", dateStyle: "full", timeStyle: "short" };
        let dateStr = new Date(p.waktu).toLocaleString("id-ID", tzOpt);
        
        // Indikator status bersih tanpa emoji
        let status = p.waktu > now ? '🟢Aktif' : '✅Selesai';

        txt += `*${index + 1}.* *${status}*\n`;
        txt += `- *Waktu:* ${dateStr} WITA\n`;
        txt += `- *Pesan:* "${p.pesan}"\n\n`;
    });

    txt += `_Untuk menghapus pengingat, ketik:_\n*${usedPrefix}delreminder <nomor>*`;

    m.reply(txt.trim());
}

handler.help = ['listreminder'];
handler.tags = ['asisten'];
handler.command = /^(listreminder|daftarpengingat|pengingatku)$/i; 

module.exports = handler;