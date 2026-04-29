const axios = require('axios')
const FormData = require('form-data')

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validasi Input (Apakah user mereply audio/video)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/audio|video/.test(mime)) {
        return m.reply(
            `🎵 *MUSIK APA INI?*\n\n` +
            `> Identifikasi detail lagu dari sebuah audio/video.\n\n` +
            `*Cara Pakai:*\n` +
            `> Reply audio dengan perintah \`${usedPrefix + command}\``
        )
    }

    // React loading
    await conn.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } })
    await m.reply(global.wait || '🕕 *MENGUPLOAD...*\n\n> Sedang memproses dan menganalisa audio...')

    try {
        // 2. Download media buffer menggunakan bawaan handler bot
        let media = await q.download()
        if (!media) throw 'Gagal mengunduh media dari pesan!'

        // 3. Upload Media ke TmpFiles (Modular)
        let formData = new FormData()
        formData.append('file', media, { filename: 'audio.mp3', contentType: 'application/octet-stream' })
        
        let uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
            headers: formData.getHeaders(),
            timeout: 60000
        })
        
        if (!uploadRes.data?.data?.url) throw new Error('Gagal mengupload audio ke server.')
        let audioUrl = uploadRes.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')

        // 4. Request ke API Neoxr
        // Note: Silahkan sesuaikan API Key Neoxr milik Anda jika diperlukan.
        const NEOXR_APIKEY = global.neoxr || 'Milik-Bot-OurinMD' 
        const apiUrl = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(audioUrl)}&apikey=${NEOXR_APIKEY}`
        
        let { data } = await axios.get(apiUrl, { timeout: 60000 })
        
        if (!data?.status || !data?.data) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply('❌ *GAGAL*\n\n> Lagu tidak dikenali. Coba gunakan audio yang lebih jelas atau durasinya lebih panjang.')
        }

        // 5. Parsing Data & Formatting Message
        let music = data.data
        let links = music.links || {}
        
        let text = `🎵 *LAGU DITEMUKAN!*\n\n`
        text += `╭┈┈⬡「 📋 *INFO* 」\n`
        text += `┃ 🎶 *Title:* ${music.title || '-'}\n`
        text += `┃ 👤 *Artist:* ${music.artist || '-'}\n`
        text += `┃ 💿 *Album:* ${music.album || '-'}\n`
        text += `┃ 📅 *Release:* ${music.release || '-'}\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        text += `*🔗 Link Streaming:*\n`
        let thumbnailUrl = 'https://telegra.ph/file/0b32e0a0bb0bb15ebef59.jpg' // Thumbnail default music
        let sourceUrl = ''

        if (links.spotify?.track?.id) {
            text += `> 🎧 *Spotify:* https://open.spotify.com/track/${links.spotify.track.id}\n`
            sourceUrl = `https://open.spotify.com/track/${links.spotify.track.id}`
        }
        if (links.youtube?.vid) {
            text += `> ▶️ *YouTube:* https://youtu.be/${links.youtube.vid}\n`
            if (!sourceUrl) sourceUrl = `https://youtu.be/${links.youtube.vid}`
        }
        if (links.deezer?.track?.id) {
            text += `> 🎵 *Deezer:* https://deezer.com/track/${links.deezer.track.id}\n`
        }

        // 6. Send Response via Context Info (UI Rich Message)
        await conn.sendMessage(m.chat, {
            text: text.trim(),
            contextInfo: {
                isForwarded: false,
                forwardingScore: 0,
                externalAdReply: {
                    title: music.title || 'Lagu Ditemukan',
                    body: music.artist || 'Music Recognition API',
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: sourceUrl || 'https://open.spotify.com',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        // React Success
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`${global.eror}\n\n> Terjadi kesalahan: ${e.message || e}`)
    }
}

handler.help = ['whatmusic', 'shazam', 'musikapaini'].map(v => v + ' <reply audio>')
handler.tags = ['tools']
handler.command = /^(whatmusic|shazam|recognizemusic|mai|musikapaini)$/i

// Keamanan & Pengurangan Spam
handler.limit = true 
handler.register = true 

module.exports = handler