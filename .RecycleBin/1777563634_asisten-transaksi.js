let fetch = require('node-fetch')
let moment = require('moment-timezone')

let handler = async (m, { conn, args, command, usedPrefix }) => {
    if (args.length < 2) {
        return m.reply(`⚠️ *Format Salah!*\n\nContoh penggunaan:\n*${usedPrefix + command} 50000 Jual Pulsa*`)
    }

    let nominal = parseInt(args[0].replace(/[^0-9]/g, '')) 
    if (isNaN(nominal)) return m.reply(`⚠️ Nominal harus berupa angka!`)

    let keterangan = args.slice(1).join(' ')
    let tipe = command.toLowerCase() === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'
    
    // Setup Waktu (WITA)
    let now = moment.tz('Asia/Makassar')
    let tanggalFormat = now.format('DD/MM/YYYY HH:mm:ss') // Format untuk masuk ke Sheet
    let mmdd = now.format('MMDD') // Format untuk Kode Ref (Contoh: 0310)

    // ----------------------------------------------------
    // 🧠 SISTEM PENGHITUNG TRANSAKSI HARIAN
    // ----------------------------------------------------
    global.db.data.stats = global.db.data.stats || {}
    
    // Buat baru atau reset jika berganti hari
    if (!global.db.data.stats.bukukas || global.db.data.stats.bukukas.date !== mmdd) {
        global.db.data.stats.bukukas = { date: mmdd, count: 0 }
    }

    // Tambah hitungan transaksi
    global.db.data.stats.bukukas.count += 1
    let urutan = global.db.data.stats.bukukas.count

    // Merakit Kode Ref dengan format 4 digit (Contoh: 03100001)
    let seqString = String(urutan).padStart(4, '0')
    let refCode = `${mmdd}${seqString}`
    // ----------------------------------------------------

    m.reply(`⏳ _Mencatat ${tipe.toLowerCase()} ke Google Sheets..._`)

    try {
        // ==========================================
        // ⚠️ PASTE URL WEB APP GOOGLE YANG BARU DI SINI:
        // ==========================================
        let webAppUrl = global.api_gsheet
        // ==========================================

        // INI BAGIAN YANG DIPERBAIKI: 
        // Mengirimkan 'action' dan 'ref' agar ditangkap oleh Google
        let payload = {
            action: 'insert',
            tanggal: tanggalFormat,
            tipe: tipe,
            nominal: nominal,
            keterangan: keterangan,
            ref: refCode
        }

        let res = await fetch(webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            redirect: 'follow' 
        })

        let json = await res.json()

        if (json.status === 'success') {
            let formatRupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(nominal)
            
            let nota = `✅ *BUKU KAS TERCATAT!*\n\n`
            nota += `🔖 *Kode Ref:* \`${refCode}\`\n`
            nota += `📅 *Waktu:* ${tanggalFormat} WITA\n`
            nota += `🔄 *Tipe:* ${tipe}\n`
            nota += `💰 *Nominal:* ${formatRupiah}\n`
            nota += `📝 *Keterangan:* ${keterangan}\n\n`
            nota += `_Gunakan Kode Ref di atas jika ingin menghapus transaksi ini nanti._`
            
            m.reply(nota)
        } else {
            // Rollback jika Google menolak
            global.db.data.stats.bukukas.count -= 1
            m.reply(`⚠️ *Google Menjawab:* ${json.message}`)
        }
    } catch (e) {
        console.error(e)
        // Rollback hitungan jika error koneksi
        global.db.data.stats.bukukas.count -= 1
        m.reply(`❌ *SISTEM ERROR!*\nBot gagal mencatat ke Google Sheets.`)
    }
}

handler.help = ['pemasukan <jumlah> <ket>', 'pengeluaran <jumlah> <ket>']
handler.tags = ['asisten']
handler.command = /^(pemasukan|pengeluaran)$/i
handler.owner = true 

module.exports = handler