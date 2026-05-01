let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // 1. Pengecekan Input Kosong (Teks panduan durasi dihapus)
        if (!text) return m.reply(`Ketik formatnya!\n\n*Contoh:*\n${usedPrefix + command} 12:00 | Makan Siang \n_ATAU_\n${usedPrefix + command} 28-04-2026 15:30 | Rapat nanti sore`);
        
        // 2. Pengecekan Tanda Pemisah
        if (!text.includes('|')) return m.reply(`Jangan lupa pakai tanda | (garis lurus)\n\n*Contoh:*\n${usedPrefix + command} 15:30 | Rapat`);

        // 3. Memecah Teks
        let split = text.split('|');
        let timeInput = split[0].trim();
        let pesan = split.slice(1).join('|').trim();

        if (!timeInput || !pesan) return m.reply('Waktu atau pesan tidak boleh kosong!');

        // 4. Deteksi dan Konversi Waktu
        let ms = 0;
        let now = Date.now();
        let formatTipe = '';

        // Tipe Jam WITA (Contoh: 15:30)
        if (/^[0-9]{1,2}:[0-9]{2}$/.test(timeInput)) {
            let [jam, menit] = timeInput.split(':');
            let target = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
            target.setHours(parseInt(jam), parseInt(menit), 0, 0);
            
            // Jika jam sudah lewat, anggap untuk besok
            if (target.getTime() < Date.now()) target.setDate(target.getDate() + 1);
            ms = target.getTime() - Date.now();
            formatTipe = `Jam (${timeInput} WITA)`;
        }
        // Tipe Tanggal & Jam (Contoh: 19-02-2026 15:30)
        else if (/^[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}\s+[0-9]{1,2}:[0-9]{2}$/.test(timeInput)) {
            let [tglBlnThn, jamMenit] = timeInput.split(/\s+/);
            let [d, mo, y] = tglBlnThn.split('-');
            let [h, menitStr] = jamMenit.split(':');
            
            // Merakit ISO Makassar (UTC+8)
            let iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${h.padStart(2, '0')}:${menitStr.padStart(2, '0')}:00+08:00`;
            let targetMs = new Date(iso).getTime();
            
            if (isNaN(targetMs)) return m.reply('Format tanggal salah! Gunakan DD-MM-YYYY HH:MM');
            ms = targetMs - now;
            formatTipe = `Tanggal (${timeInput})`;
        } 
        else {
            // Pesan error jika format salah (contoh durasi dihapus)
            return m.reply('Format waktu tidak dikenali!\n\nGunakan format:\n- Jam: 15:30\n- Tanggal: 19-02-2026 15:30');
        }

        if (ms < 0) return m.reply('Waktu tidak boleh di masa lalu!');
        let targetTime = now + ms;

        // 5. Simpan ke Database Aman
        global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
        let user = global.db.data.users[m.sender];
        user.pengingat = user.pengingat || [];

        user.pengingat.push({
            pesan: pesan,
            waktu: targetTime,
            status: 0 // 0 = belum, 1 = sudah dikirim
        });

        // 6. Konfirmasi ke Grup/PC
        m.reply(`✅ *Reminder Disimpan*\n\n📝 *Pesan:* ${pesan}\n⏱️ *Waktu:* ${formatTipe}\n\nSaya akan mengirim pesan otomatis melalui chat pribadi anda nanti.`);

    } catch (e) {
        console.error(e);
        m.reply(`Terjadi sistem error:\n${e.toString()}`);
    }
}

handler.help = ['reminder <jam>|<isi>'];
handler.tags = ['asisten'];
handler.command = /^(reminder|pengingat)$/i;
handler.owner = true;

module.exports = handler;