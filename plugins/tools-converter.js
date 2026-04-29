const { ezgifConvert } = require('../lib/ezgif')

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validasi Input
    const notStickerMessage = `Balas stiker yang ingin diubah dengan perintah *${usedPrefix + command}*`
    if (!m.quoted) return m.reply(notStickerMessage)
    
    let q = m.quoted
    let mime = q.mimetype || ''
    if (!/webp/.test(mime)) return m.reply(notStickerMessage)

    // Menampilkan pesan loading dari config global
    m.reply(global.wait)
    
    try {
        // Download media dari pesan WhatsApp
        let media = await q.download()
        let isVideo = /to(vid|mp4)/i.test(command)
        let endpointType = isVideo ? 'webp-to-mp4' : 'webp-to-png'

        // 2. Eksekusi Scraper Konversi dari Folder /lib
        let resultUrl = await ezgifConvert(media, endpointType)

        // 3. Kirim Media Berdasarkan Tipe Command
        if (isVideo) {
            await conn.sendMessage(m.chat, { 
                video: { url: resultUrl }, 
                caption: '✅ *Sukses mengonversi stiker ke video!*',
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                image: { url: resultUrl }, 
                caption: '✅ *Sukses mengonversi stiker ke gambar!*' 
            }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        // Fallback khusus untuk Image jika scraper gagal atau error network
        if (/to(img|png)/i.test(command)) {
            try {
                let media = await q.download()
                await conn.sendMessage(m.chat, { image: media, caption: '✅ *Sukses convert ke gambar (Fallback)*' }, { quoted: m })
            } catch (err) {
                m.reply(global.eror)
            }
        } else {
            m.reply(`❌ *Gagal mengkonversi stiker.*\n\nDetail Error: ${e.message}`)
        }
    }
}

handler.help = ['toimg', 'tovid']
handler.tags = ['tools']
handler.command = /^(toimg|topng|tovid|tomp4)$/i

// Flag keamanan untuk membatasi spam
handler.limit = true 
handler.group = false

module.exports = handler