let fetch = require('node-fetch')

let handler = async (m, { conn, usedPrefix }) => {
    m.reply(`⏳ _Mengonversi Spreadsheet ke Excel, mohon tunggu..._`)

    try {
        let webAppUrl = global.api_gsheet

        let res = await fetch(webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'export' }),
            redirect: 'follow'
        })

        let json = await res.json()

        if (json.status === 'success') {
            // Mendownload file dari Google menggunakan token OAuth
            let response = await fetch(json.downloadUrl, {
                headers: { 'Authorization': 'Bearer ' + json.token }
            })
            
            let buffer = await response.buffer()

            // Mengirim file ke WhatsApp
            await conn.sendFile(
                m.chat, 
                buffer, 
                json.fileName, 
                `✅ *Export Berhasil!*\n\nFile: ${json.fileName}\nSilakan buka file ini dengan Microsoft Excel atau WPS Office.`, 
                m
            )
        } else {
            m.reply(`⚠️ Gagal: ${json.message}`)
        }
    } catch (e) {
        console.error(e)
        m.reply(`❌ Terjadi kesalahan saat membuat file Excel.`)
    }
}

handler.help = ['exportxlsx']
handler.tags = ['asisten']
handler.command = /^(exportxlsx|exportexcel|xlsx)$/i
handler.owner = true 

module.exports = handler