let fetch = require('node-fetch')

let handler = async (m, { conn, args, command, usedPrefix }) => {
    if (!args[0]) {
        return m.reply(`⚠️ *Format Salah!*\n\nSebutkan Kode Referensi yang ingin dihapus.\nContoh: *${usedPrefix + command} 03100001*`)
    }

    let refCode = args[0].trim()

    m.reply(`⏳ _Melacak dan menghapus transaksi ${refCode} di Google Sheets..._`)

    try {
        // ==========================================
        // ⚠️ PASTE URL WEB APP GOOGLE YANG BARU DI SINI:
        // ==========================================
        let webAppUrl = global.api_gsheet
        // ==========================================

        let payload = {
            action: 'delete',
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
            m.reply(`🗑️ *TRANSAKSI BERHASIL DIHAPUS!*\n\nData dengan Kode Ref \`${refCode}\` telah dihanguskan dan dihapus dari baris Google Sheets Anda.`)
        } else {
            m.reply(`⚠️ *Gagal:* ${json.message}\nPastikan kodenya benar dan belum pernah dihapus.`)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ *SISTEM ERROR!*\nBot gagal menghubungi Google Sheets.`)
    }
}

handler.help = ['deltrx <kode_ref>']
handler.tags = ['asisten']
handler.command = /^(delkas|deltrx|deletekas)$/i
handler.owner = true 

module.exports = handler