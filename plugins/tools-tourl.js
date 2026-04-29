/**
 * Plugin Name: Multi-Server Media Uploader
 * Location: ./plugins/tools-tourl.js
 */

const { uploadImage, uploadToTelegraph, uploadTo0x0, uploadToTmpfiles, uploadToCatbox, uploadToUguu } = require('../lib/tourl')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) {
        let caption = `*Format Salah!*\n\n`
        caption += `Kirim atau balas gambar/video dengan perintah:\n`
        caption += `• *${usedPrefix + command}* (Mode Otomatis)\n`
        caption += `• *${usedPrefix + command} uguu* (Maks 100MB, 48 Jam)\n`
        caption += `• *${usedPrefix + command} catbox* (Maks 200MB)\n`
        caption += `• *${usedPrefix + command} telegraph* (Maks 5MB, MP4/IMG)\n`
        caption += `• *${usedPrefix + command} tmpfiles* (File Sementara)\n`
        caption += `• *${usedPrefix + command} 0x0* (Direct Link)`
        return m.reply(caption)
    }

    m.reply(global.wait || '⏳ Sedang mengunggah media ke server, mohon tunggu...')

    try {
        let media = await q.download()
        let platform = args[0] ? args[0].toLowerCase() : 'auto'
        let link = ''
        let serverName = ''

        // ─── ROUTING BERDASARKAN INPUT USER ───
        switch (platform) {
            case 'uguu':
                link = await uploadToUguu(media)
                serverName = 'Uguu.se'
                break
            case 'catbox':
                link = await uploadToCatbox(media)
                serverName = 'Catbox.moe'
                break
            case 'telegraph':
            case 'tele':
                link = await uploadToTelegraph(media)
                serverName = 'Telegra.ph'
                break
            case 'tmpfiles':
            case 'tmp':
                link = await uploadToTmpfiles(media)
                serverName = 'Tmpfiles.org'
                break
            case '0x0':
            case '0x0.st':
                link = await uploadTo0x0(media)
                serverName = '0x0.st'
                break
            case 'auto':
            default:
                // Jika input tidak dikenali, gunakan mode Auto Fallback
                link = await uploadImage(media)
                serverName = 'Auto (Multi-Server Fallback)'
                break
        }

        // ─── FORMATTING OUTPUT ───
        let caption = `*MEDIA UPLOADER SUCCESS*\n`
        caption += `──────────────────\n`
        caption += `📡 *Server:* ${serverName}\n`
        caption += `🔗 *URL:* ${link}\n`
        caption += `📦 *Size:* ${formatBytes(media.length)}\n`
        caption += `📂 *Mime:* ${mime}\n`
        caption += `──────────────────\n`
        caption += `> Link ini bersifat publik. Gunakan dengan bijak.`

        await m.reply(caption)

    } catch (e) {
        console.error(e)
        let errorMsg = global.eror || `[!] Gagal mengunggah media.\n\n*Penyebab umum:*\n1. File terlalu besar untuk server tersebut.\n2. Server sedang down (coba gunakan parameter server lain).`
        throw errorMsg
    }
}

handler.help = ['tourl', 'upload'].map(v => v + ' <opsi>')
handler.tags = ['tools']
handler.command = /^(tourl|upload|toimg)$/i
handler.limit = true

module.exports = handler

// Helper untuk membaca ukuran media
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}