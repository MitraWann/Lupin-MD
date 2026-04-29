/**
 * TULIPNEX USER GUIDE & TUTORIAL
 * Location: ./plugins/trading-guide.js
 * Feature: Buku panduan interaktif lengkap dengan P2P & Leaderboard
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    let guide = `🌱 *TULIPNEX: CYBER-BOTANICAL EXCHANGE* 📈\n`;
    guide += `Selamat datang di ekosistem ekonomi digital TulipNex!\n\n`;
    
    guide += `*1️⃣ MEMAHAMI PASAR (MARKET)*\n`;
    guide += `Di sini, harga 6 aset botani (IVL, LBT, IRC, LTN, RSX, TNX) naik turun setiap menit. Tugas Anda: Beli saat murah, Jual saat mahal.\n`;
    guide += `• *${usedPrefix}ind* \n> Melihat pergerakan harga, tren, dan berita pasar.\n`;
    guide += `• *${usedPrefix}ind <ticker>* \n> Melihat detail data histori aset botani.\n`;
    guide += `• *${usedPrefix}pf* \n> Mengecek isi dompet dan total kekayaan Anda.\n\n`;
    
    guide += `*2️⃣ TRANSAKSI UTAMA (TRADING)*\n`;
    guide += `• *${usedPrefix}in <ticker> <jumlah>* \n> Membeli aset (Contoh: ${usedPrefix}in TNX 10)\n`;
    guide += `• *${usedPrefix}ex <ticker> <jumlah>* \n> Menjual aset (Contoh: ${usedPrefix}ex TNX all)\n\n`;

    guide += `*3️⃣ PASAR GELAP (P2P TRADING)*\n`;
    guide += `Hindari pajak bursa dan jual aset Anda langsung ke pemain lain dengan harga suka-suka!\n`;
    guide += `• *${usedPrefix}offeraset @user <ticker> <qty> <harga>* \n> Membuat penawaran kepada pemain lain (Otomatis hangus dalam 5 menit).\n`;
    guide += `• *${usedPrefix}terimaaset @user* \n> Menerima penawaran aset pemain lain.\n`;
    guide += `• *${usedPrefix}tolakaset @user* \n> Menolak penawaran aset pemain lain.\n\n`;

    guide += `*4️⃣ PASIF INCOME (CYBER-GREENHOUSE)*\n`;
    guide += `Jangan biarkan aset menganggur! Tanam di kebun untuk hasilkan uang setiap jam.\n`;
    guide += `• *${usedPrefix}tanam <ticker> <jumlah>* \n> Kunci aset ke kebun.\n`;
    guide += `• *${usedPrefix}kebun* \n> Pantau estimasi profit tanaman Anda.\n`;
    guide += `• *${usedPrefix}panen* \n> Ambil semua keuntungan ke saldo utama.\n`;
    guide += `• *${usedPrefix}cabut <ticker> <jumlah>* \n> Tarik aset kembali ke dompet.\n\n`;

    guide += `*5️⃣ FASILITAS BANK SENTRAL (GADAI)*\n`;
    guide += `Butuh uang cepat saat harga jatuh tapi tidak mau jual aset? Gadai saja!\n`;
    guide += `• *${usedPrefix}gadai <ticker> <jumlah>* \n> Pinjam uang (Plafon 50%, Bunga 15%, Tenor 3 Hari).\n`;
    guide += `• *${usedPrefix}utang* \n> Cek sisa waktu dan tagihan Anda.\n`;
    guide += `• *${usedPrefix}tebus* \n> Lunasi utang sebelum aset Anda DISITA!\n\n`;
    
    guide += `*6️⃣ TOP TRADER (LEADERBOARD)*\n`;
    guide += `Buktikan Anda adalah "Whale" (Paus) terbesar di TulipNex!\n`;
    guide += `• *${usedPrefix}toptrader* \n> Melihat daftar 10 pemain dengan total kekayaan (Net Worth) tertinggi di server.\n\n`;

    guide += `*7️⃣ DEWAN DIREKSI (SISTEM OLIGARKI)*\n`;
    guide += `Top 3 trader yang memiliki aset TNX terbanyak akan menempati jabatan di dewan direksi TulipNex Inc. Setiap jabatan memiliki  privilege dan kewenangan untuk intervensi besaran pajak penjualan aset. \n`;
    guide += `- *CEO (Top 1)*: Usul pajak, 50% Dividen, Bebas Pajak 100%.\n`;
    guide += `- *Komisaris (Top 2)*: Veto pajak, 30% Dividen, Diskon Pajak 50%.\n`;
    guide += `- *Direktur (Top 3)*: Veto pajak, 20% Dividen, Diskon Pajak 25%.\n`;
    guide += `• *${usedPrefix}ceo* \n> Melihat dashboard korporat & regulasi.\n`;
    guide += `• *${usedPrefix}claimdividen* \n> _(Khusus Direksi)_ Cairkan brankas bersama.\n`;
    guide += `• *${usedPrefix}ajukanpajak <ticker/ALL> <%>* \n> _(Khusus CEO)_ Usulkan tarif pajak.\n`;
    guide += `• *${usedPrefix}setujupajak / tolakpajak* \n> _(Khusus Komisaris/Direktur)_ ACC / Veto usulan CEO.\n\n`;

    guide += `*💡 TIPS & TRIK PEMULA:*\n`;
    guide += `1. *Pantau Berita:* TULIPNEX NEWS FLASH bisa memicu harga meroket atau anjlok drastis.\n`;
    guide += `2. *Awas Likuidasi:* Jangan serakah meminjam dari Bank jika tak bisa melunasi.\n`;
    guide += `3. *Gunakan "ALL":* Ketik ${usedPrefix}in TNX all untuk membeli sebanyak saldo Anda.\n`;
    guide += `4. *Rebut Takhta:* Borong TNX untuk merebut posisi Dewan Direksi dan hindari potongan pajak bursa!\n`;
	guide += `5. *Claim Dividen:* Dewan direksi dapat mengclaim isi brankas perusahaan (Dividen) yang berasal dari pajak penjualan aset. \n\n`;
    
    guide += `──────────────────\n`;
    guide += `> Ketik perintah di atas untuk memulai perjalanan finansial Anda!`;

    return m.reply(guide);
}

handler.help = ['tutorial', 'guide', 'tulipnex']
handler.tags = ['tulipnex']
handler.command = /^(tutorial|guide|panduan|tulipnex|caramain)$/i
handler.rpg = true 

module.exports = handler;