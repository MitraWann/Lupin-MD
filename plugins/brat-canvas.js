const { createCanvas } = require('canvas')
const { Sticker, StickerTypes } = require('wa-sticker-formatter')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) {
        return m.reply(`Kirimkan teks yang ingin dijadikan stiker.\n*Contoh:* ${usedPrefix + command} ini teks brat`)
    }

    // 2. Tampilkan pesan loading stiker
    m.reply(global.stiker_wait)

    try {
        const size = 512
        const canvas = createCanvas(size, size)
        const ctx = canvas.getContext('2d')

        // Set background putih
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)

        // Set teks hitam
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        let fontSize = 100
        ctx.font = `${fontSize}px Arial`

        let words = text.toLowerCase().split(' ')
        let lines = []
        let currentLine = words[0]

        // Proses Auto-Wrap Text
        for (let i = 1; i < words.length; i++) {
            let word = words[i]
            let width = ctx.measureText(currentLine + " " + word).width
            if (width < size - 40) {
                currentLine += " " + word
            } else {
                lines.push(currentLine)
                currentLine = word
            }
        }
        lines.push(currentLine)

        let totalHeight = lines.length * (fontSize + 10)
        let startY = (size - totalHeight) / 2 + (fontSize / 2)

        // Proses penulisan ke canvas dengan Auto-Scale
        for (let i = 0; i < lines.length; i++) {
            while (ctx.measureText(lines[i]).width > size - 40 && fontSize > 20) {
                fontSize -= 5
                ctx.font = `${fontSize}px Arial`
            }
            ctx.fillText(lines[i], size / 2, startY + (i * (fontSize + 10)))
        }

        const buffer = canvas.toBuffer('image/png')

        // 3. Konversi ke Sticker WebP menggunakan wa-sticker-formatter
        const sticker = new Sticker(buffer, {
            pack: global.packname || 'Bot Sticker', // Mengambil dari config.js
            author: global.author || 'Owner',       // Mengambil dari config.js
            type: StickerTypes.FULL,
            quality: 100,
            background: '#FFFFFF'
        })

        const stickerBuffer = await sticker.toBuffer()

        // 4. Kirim Stiker ke Chat
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })

    } catch (e) {
        console.error("Brat Canvas Error:", e)
        m.reply(global.eror)
    }
}

// Metadata Plugin
handler.help = ['brat <teks>', 'bratc <teks>']
handler.tags = ['maker']
handler.command = /^(bratc|bratcanvas)$/i

// Pembatasan fitur
handler.limit = true 

module.exports = handler