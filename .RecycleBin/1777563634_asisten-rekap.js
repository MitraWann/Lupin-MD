let fetch = require('node-fetch')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`⚠️ *Format Salah!*\n\nContoh: *${usedPrefix + command} pulsa* atau *${usedPrefix + command} makan*`)

    let keyword = args[0].toLowerCase()
    m.reply(`⏳ _Mencari detail transaksi "${keyword}"..._`)

    try {
        let webAppUrl = global.api_gsheet

        let res = await fetch(webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rekap', keyword: keyword }),
          redirect: 'follow'
        })

        let json = await res.json()

        if (json.status === 'success') {
            let f = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
            let displayKeyword = (json.keyword || keyword).toUpperCase()
            
            let teks = `📊 *DETAIL TRANSAKSI: "${displayKeyword}"*\n\n`
            
            // 1. Cek apakah ada data detail transaksi
            if (json.details && json.details.length > 0) {
            json.details.forEach((item, index) => {
                teks += `*${index + 1}.* [${item.tanggal}]\n`
                teks += `   ├ 📝 ${item.keterangan}\n`
                teks += `   ├ 💰 *${f.format(item.nominal)}*\n`
                teks += `   └ 🆔 Ref: \`${item.ref || '-'}\`\n\n` // Menampilkan Ref dengan format mono (bergaris abu-abu)
            })
        } else {
            teks += `_Tidak ada rincian data ditemukan._\n\n`
        }
            // 2. Total di bagian akhir
            teks += `\n📌 *RINGKASAN AKHIR*`
            teks += `\n📝 *Total Item:* ${json.jumlah_transaksi}`
            teks += `\n💵 *Total Nominal:* *${f.format(json.total)}*\n`
            teks += `\n_Data berhasil ditarik dari Google Sheets._`
            
            m.reply(teks)
        } else {
            m.reply(`⚠️ Gagal: ${json.message}`)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ Terjadi kesalahan sistem. Pastikan Apps Script Anda mengirimkan data "details".`)
    }
}

handler.help = ['rekap <kata kunci>']
handler.tags = ['asisten']
handler.command = /^rekap$/i
handler.owner = true 

module.exports = handler