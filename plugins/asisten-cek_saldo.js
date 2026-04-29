let fetch = require('node-fetch')

let handler = async (m, { conn, usedPrefix }) => {
    m.reply(`⏳ _Sedang menghitung saldo dari Google Sheets..._`)

    try {
        // ==========================================
        // ⚠️ PASTE URL WEB APP GOOGLE YANG PALING BARU:
        // ==========================================
        let webAppUrl = global.api_gsheet
        // ==========================================

        let res = await fetch(webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'read' }),
            redirect: 'follow'
        })

        let json = await res.json()

        if (json.status === 'success') {
            let f = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
            
            let teks = `💰 *LAPORAN KAS SAAT INI*\n\n`
            teks += `📥 *Pemasukan:* ${f.format(json.pemasukan)}\n`
            teks += `📤 *Pengeluaran:* ${f.format(json.pengeluaran)}\n`
            teks += `––––––––––––––––––––––\n`
            teks += `💵 *Sisa Saldo:* *${f.format(json.saldo)}*\n\n`
            teks += `_Data dihitung secara real-time dari Spreadsheet._`
            
            m.reply(teks)
        } else {
            m.reply(`⚠️ Gagal mengambil data: ${json.message}`)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ Terjadi kesalahan saat menghubungi server Google.`)
    }
}

handler.help = ['kas', 'rekapkas']
handler.tags = ['asisten']
handler.command = /^(cekkas|rekapkas|kas)$/i
handler.owner = true 

module.exports = handler