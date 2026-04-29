/**
 * RPG JOBS SYSTEM (CIVILIAN EDITION)
 * Location: ./plugins/rpg-kerja.js
 */

let handler = async (m, { conn, command, usedPrefix, text }) => {
    let user = global.db.data.users[m.sender]
    
    // Inisialisasi variabel jika belum ada di database
    if (typeof user.job !== 'string') user.job = 'Pengangguran'
    if (typeof user.lastkerja !== 'number') user.lastkerja = 0
    if (typeof user.rumah !== 'string') user.rumah = 'Tidak Ada'
    if (typeof user.money !== 'number') user.money = 0
    if (typeof user.exp !== 'number') user.exp = 0

    // DAFTAR PEKERJAAN MASYARAKAT SIPIL (10 Jenis)
    const daftarPekerjaan = {
        'kuli': { level: 0, gaji: 2000, exp: 50, msg: '🏗️ Kamu bekerja keras memanggul semen dan bata di proyek.' },
        'pencucipiring': { level: 2, gaji: 3500, exp: 70, msg: '🍽️ Kamu menggosok panci dan piring kotor seharian di restoran.' },
        'kurir': { level: 5, gaji: 5500, exp: 100, msg: '📦 Kamu mengantar puluhan paket menembus kemacetan kota.' },
        'petani': { level: 10, gaji: 9000, exp: 150, msg: '🌾 Kamu menanam padi dan menyiram sayuran di bawah terik matahari.' },
        'montir': { level: 15, gaji: 14000, exp: 220, msg: '🔧 Kamu berlumuran oli memperbaiki mesin kendaraan pelanggan.' },
        'supir': { level: 20, gaji: 20000, exp: 300, msg: '🚌 Kamu mengemudi bus antarkota antarprovinsi dengan hati-hati.' },
        'pedagang': { level: 30, gaji: 32000, exp: 450, msg: '🏪 Kamu menjaga warung sembako dari pagi hingga larut malam.' },
        'koki': { level: 40, gaji: 50000, exp: 700, msg: '🍳 Kamu memasak hidangan spesial untuk ratusan tamu restoran.' },
        'programmer': { level: 55, gaji: 80000, exp: 1200, msg: '💻 Kamu begadang semalaman memperbaiki bug di aplikasi klien.' },
        'dokter': { level: 75, gaji: 150000, exp: 2500, msg: '🩺 Kamu berhasil melakukan operasi bedah dan menyelamatkan nyawa pasien.' }
    }

    // MAP BUFF RUMAH (Digunakan untuk kalkulasi pajak & bonus saat kerja)
    const buffRumah = {
        'gubuk': { taxDisc: 0.02, expBuff: 1.1 },
        'kontrakan': { taxDisc: 0.04, expBuff: 1.2 },
        'apartemen': { taxDisc: 0.06, expBuff: 1.4 },
        'rumahkpr': { taxDisc: 0.08, expBuff: 1.6 },
        'villa': { taxDisc: 0.10, expBuff: 1.8 },
        'mansion': { taxDisc: 0.10, expBuff: 2.0 }
    }

    // COMMAND: MELIHAT DAFTAR PEKERJAAN
    if (command === 'pekerjaan') {
        let caption = `💼 *BURSA KERJA KOTA*\n\n`
        for (let [id, j] of Object.entries(daftarPekerjaan)) {
            caption += `• *${id.toUpperCase()}*\n`
            caption += `  > Syarat Level : ${j.level}\n`
            caption += `  > Gaji Pokok   : Rp ${j.gaji.toLocaleString()}\n`
        }
        caption += `\n📝 *Cara Melamar:* \`${usedPrefix}lamar <nama_kerja>\`\n💼 *Mulai Bekerja:* \`${usedPrefix}kerja\``
        return m.reply(caption)
    }

    // COMMAND: MELAMAR PEKERJAAN
    if (command === 'lamar') {
        if (!text) throw `Mohon masukkan nama pekerjaan.\nContoh: *${usedPrefix}lamar montir*`
        let jobName = text.toLowerCase()
        if (!daftarPekerjaan[jobName]) throw `Pekerjaan *${text}* tidak tersedia di bursa kerja.`
        if (user.level < daftarPekerjaan[jobName].level) throw `Pengalamanmu kurang! Dibutuhkan level *${daftarPekerjaan[jobName].level}* untuk menjadi ${jobName.toUpperCase()}.`
        
        user.job = jobName
        return m.reply(`✅ *Selamat!* Lamaranmu diterima. Sekarang kamu resmi bekerja sebagai *${jobName.toUpperCase()}*.`)
    }

    // COMMAND: BEKERJA
    if (command === 'kerja') {
        if (user.job === 'Pengangguran') throw `Kamu belum memiliki pekerjaan! Ketik *${usedPrefix}pekerjaan* untuk mencari kerja.`
        
        let cooldown = 300000 // Cooldown 1 Jam
        let timeRemaining = cooldown - (new Date() - user.lastkerja)
        
        if (timeRemaining > 0) {
            let minutes = Math.ceil(timeRemaining / 60000)
            throw `Kamu masih lelah setelah bekerja. Istirahatlah selama *${minutes} menit* lagi.`
        }

        // FIX: Pastikan string pekerjaan menjadi lowercase untuk pencocokan key database
        let currentJob = user.job.toLowerCase()
        let j = daftarPekerjaan[currentJob]

        // FIX: Jika pekerjaan tidak ditemukan di daftar (data usang dari database lama), reset ke Pengangguran
        if (!j) {
            user.job = 'Pengangguran'
            throw `Pekerjaanmu sebelumnya tidak valid atau telah dihapus dari sistem. Silakan melamar pekerjaan baru dengan mengetik *${usedPrefix}pekerjaan*.`
        }

        // FIX: Pastikan tipe rumah selalu string sebelum di-lowercase
        let propertiUser = (typeof user.rumah === 'string' ? user.rumah.toLowerCase() : 'tidak ada')
        let buff = buffRumah[propertiUser] || { taxDisc: 0, expBuff: 1 }

        // Sistem Pajak Penghasilan (Dasar 10%)
        let pajakBase = 0.10 
        let realPajak = Math.max(0, pajakBase - buff.taxDisc)
        let potonganPajak = Math.floor(j.gaji * realPajak)
        let gajiBersih = j.gaji - potonganPajak
        let expGained = Math.floor(j.exp * buff.expBuff)

        user.money += gajiBersih
        user.exp += expGained
        user.lastkerja = new Date() * 1

        let resText = `${j.msg}\n\n`
        resText += `💰 *Gaji Bersih:* Rp ${gajiBersih.toLocaleString()}\n`
        resText += `📉 *Pajak Sipil (${(realPajak * 100).toFixed(0)}%):* -Rp ${potonganPajak.toLocaleString()}\n`
        resText += `✨ *Exp Didapat:* +${expGained.toLocaleString()}\n`
        if (user.rumah !== 'Tidak Ada' && user.rumah !== 'tidak ada') resText += `🏠 *Buff Properti:* Aktif (${user.rumah})`
        
        return m.reply(resText)
    }
}

handler.help = ['kerja', 'pekerjaan', 'lamar <pekerjaan>']
handler.tags = ['rpg']
handler.command = /^(kerja|pekerjaan|lamar)$/i
handler.rpg = true 

module.exports = handler