let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Panduan penggunaan jika format kosong
    if (!text) {
        return m.reply(`⚙️ *FITUR PESAN TERJADWAL*\n\nGunakan format:\n*${usedPrefix + command} nomor | waktu | pesan*\n\n*Contoh:*\n${usedPrefix + command} 628123456789 | 15:30 | Halo bro, jangan lupa meeting jam 4 sore ya!`);
    }

    // Memecah input berdasarkan tanda garis vertikal (|)
    let [nomor, waktuStr, ...pesanArr] = text.split('|');
    
    if (!nomor || !waktuStr || pesanArr.length === 0) {
        return m.reply(`⚠️ Format salah!\nPastikan menggunakan tanda | sebagai pemisah.\n\n*Contoh:*\n${usedPrefix + command} 628123456789 | 15:30 | Pesan disini`);
    }

    // Menggabungkan kembali pesan jika di dalamnya ada tanda |
    let pesan = pesanArr.join('|').trim();
    
    // Membersihkan nomor (menghapus spasi, +, strip) lalu menambahkan ID WhatsApp
    nomor = nomor.replace(/[^0-9]/g, ''); 
    let jid = nomor + '@s.whatsapp.net';

    // Konversi waktu (Menggunakan fungsi anti-bug Pterodactyl)
    let targetTime = parseTimeStr(waktuStr);
    if (!targetTime) return m.reply(`⚠️ Format waktu salah! Gunakan format Jam (HH:MM) atau (DD-MM-YYYY HH:MM)`);
    if (targetTime <= Date.now()) return m.reply(`⚠️ Waktu sudah terlewat! Masukkan waktu di masa depan.`);

    // Membuat keranjang database jika belum ada
    global.db.data.sendlater = global.db.data.sendlater || [];
    
    // Menyimpan ke database
    global.db.data.sendlater.push({
        jid: jid,           // Nomor target
        pesan: pesan,       // Isi pesan
        waktu: targetTime,  // Jam dikirim (dalam milidetik)
        pengirim: m.sender  // Nomor Anda (Owner) untuk dikasih laporan nanti
    });

    let dateStr = new Date(targetTime).toLocaleString("id-ID", { timeZone: "Asia/Makassar", dateStyle: "full", timeStyle: "short" });
    m.reply(`✅ *Pesan Terjadwal Berhasil Dibuat!*\n\n👤 Target: ${nomor}\n🕒 Waktu: ${dateStr} WITA\n📝 Pesan: "${pesan}"\n\n_Bot akan otomatis mengirimkan pesan ini pada waktu yang ditentukan._`);
}

handler.help = ['sendlater <nomor|waktu|isi>'];
handler.tags = ['asisten'];
// Bisa dipanggil pakai .sendlater, .jadwalpesan, atau .kirimnanti
handler.command = /^(sendlater|jadwalpesan|kirimnanti)$/i;
handler.owner = true; // Kunci mutlak khusus Owner

module.exports = handler;

// ==========================================
// FUNGSI KONVERSI WAKTU 
// ==========================================
function parseTimeStr(str) {
    str = str.toLowerCase().trim();
    let nowAbs = Date.now();

    let regexDate = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2})[.:](\d{2})$/;
    if (regexDate.test(str)) {
        let [, d, mo, y, h, m] = str.match(regexDate);
        let iso = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+08:00`;
        let timeMs = new Date(iso).getTime();
        if (!isNaN(timeMs)) return timeMs;
    }

    let regexTime = /^(\d{1,2})[.:](\d{2})$/;
    if (regexTime.test(str)) {
        let [, h, m] = str.match(regexTime);
        
        // Memakai offset absolut agar kebal dari Bug Zona Waktu Pterodactyl
        let d = new Date();
        let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        let nd = new Date(utc + (3600000 * 8)); // Paksa ke WITA

        let target = new Date(nd);
        target.setHours(parseInt(h), parseInt(m), 0, 0);

        // Jika jam yang diketik sudah lewat hari ini, anggap besok
        if (target.getTime() < nd.getTime()) {
            target.setDate(target.getDate() + 1); 
        }
        
        let diff = target.getTime() - nd.getTime();
        return nowAbs + diff;
    }
    return null; 
}