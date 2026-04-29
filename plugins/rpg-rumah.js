/**
 * RPG REAL ESTATE SYSTEM
 * Location: ./plugins/rpg-rumah.js
 */

let handler = async (m, { conn, command, usedPrefix, text }) => {
    let user = global.db.data.users[m.sender]
    
    // Inisialisasi variabel jika belum ada
    if (typeof user.rumah !== 'string') user.rumah = 'Tidak Ada'
    if (typeof user.money !== 'number') user.money = 0

    // DAFTAR PROPERTI & SPESIFIKASINYA
    const daftarRumah = {
        'gubuk': { harga: 50000, taxDisc: 0.02, expBuff: 1.1, desc: 'Tempat berteduh sederhana dari hujan.' },
        'kontrakan': { harga: 150000, taxDisc: 0.04, expBuff: 1.2, desc: 'Satu petak kamar yang cukup untuk rebahan.' },
        'apartemen': { harga: 500000, taxDisc: 0.06, expBuff: 1.4, desc: 'Hunian nyaman dengan fasilitas standar di kota.' },
        'rumahkpr': { harga: 2500000, taxDisc: 0.08, expBuff: 1.6, desc: 'Rumah impian kelas menengah dengan cicilan lunas.' },
        'villa': { harga: 10000000, taxDisc: 0.10, expBuff: 1.8, desc: 'Mewah dengan halaman luas dan kolam renang.' },
        'mansion': { harga: 50000000, taxDisc: 0.10, expBuff: 2.0, desc: 'Istana megah, bukti bahwa kamu adalah sultan.' } // Pajak kerja jadi 0%
    }

    if (command === 'belirumah' || command === 'rumah') {
        // Jika tidak ada parameter, tampilkan list
        if (!text) {
            let listR = `🏠 *AGEN PROPERTI KOTA*\n_Miliki rumah untuk mendapatkan keuntungan saat bekerja!_\n\n`
            
            listR += `*Status Kamu:* Tinggal di ${user.rumah}\n\n`

            for (let [id, r] of Object.entries(daftarRumah)) {
                listR += `• *${id.toUpperCase()}*\n`
                listR += `  > 💰 Harga   : Rp ${r.harga.toLocaleString()}\n`
                listR += `  > 📈 Exp Bekerja : +${((r.expBuff - 1) * 100).toFixed(0)}%\n`
                listR += `  > 📉 Diskon Pajak: ${r.taxDisc * 100}%\n`
            }
            listR += `\nKetik: \`${usedPrefix}belirumah <tipe_rumah>\`\nContoh: \`${usedPrefix}belirumah apartemen\``
            
            return m.reply(listR)
        }
        
        let rName = text.toLowerCase()
        
        // Validasi
        if (!daftarRumah[rName]) throw `Tipe properti *${text}* tidak dijual oleh agen kami.`
        if (user.money < daftarRumah[rName].harga) throw `Uang kamu tidak cukup! Harga ${rName.toUpperCase()} adalah Rp ${daftarRumah[rName].harga.toLocaleString()}.\nUangmu: Rp ${user.money.toLocaleString()}`
        if (user.rumah.toLowerCase() === rName) throw `Kamu sudah memiliki properti tipe ini.`

        // Proses Eksekusi Beli
        user.money -= daftarRumah[rName].harga
        user.rumah = rName.charAt(0).toUpperCase() + rName.slice(1) // Capitalize awalan
        
        let resBeli = `🎉 *SERTIFIKAT KEPEMILIKAN DITERBITKAN* 🎉\n\n`
        resBeli += `Selamat! Kamu telah resmi membeli *${user.rumah}* seharga Rp ${daftarRumah[rName].harga.toLocaleString()}.\n\n`
        resBeli += `Keuntungan yang kamu dapatkan saat ${usedPrefix}kerja sekarang:\n`
        resBeli += `> Bonus Exp: +${((daftarRumah[rName].expBuff - 1) * 100).toFixed(0)}%\n`
        resBeli += `> Potongan Pajak Sipil: ${daftarRumah[rName].taxDisc * 100}%`

        return m.reply(resBeli)
    }
}

handler.help = ['belirumah', 'rumah']
handler.tags = ['rpg']
handler.command = /^(belirumah|rumah)$/i
handler.rpg = true

module.exports = handler