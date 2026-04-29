let { ytdl } = require('../lib/ytdl')

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Deteksi apakah user meminta audio (berdasarkan command ytmp3/yta)
    let isAudio = /mp3|a$/i.test(command)
    
    // 1. Validasi Input
    if (!args[0]) {
        let textInfo = `Masukkan link YouTube yang valid!\n\n*Contoh Audio:*\n${usedPrefix}ytmp3 https://youtu.be/xxxxxxx\n\n*Contoh Video:*\n${usedPrefix}ytmp4 https://youtu.be/xxxxxxx`
        
        if (!isAudio) {
            textInfo += `\n\n*Catatan:* Anda bisa menambahkan parameter resolusi di akhir untuk video (opsional).\nResolusi tersedia: 144, 240, 360, 480, 720, 1080, 1440, 2160.\n*Contoh:* ${usedPrefix}ytmp4 https://youtu.be/xxxx 1080`
        }
        return m.reply(textInfo)
    }

    let url = args[0]
    // Regex bawaan dari scraper untuk validasi URL YT
    if (!url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/)) {
        return m.reply('Link YouTube tidak valid atau ID video tidak ditemukan!')
    }

    // 2. Pesan Loading
    m.reply(global.wait)

    try {
        // 3. Tentukan resolusi (default 720p untuk video, mp3 untuk audio)
        let quality = isAudio ? 'mp3' : (args[1] || '720')
        const validVideoQualities = ['1080', '720', '480', '360', '240', '144']
        
        // Fallback jika input resolusi tidak valid
        if (!isAudio && !validVideoQualities.includes(quality)) {
            quality = '720' 
        }

        // 4. Eksekusi Scraper
        let res = await ytdl(url, quality)

        if (!res.success) throw res.data

        let { metadata, download } = res.data

        // 5. Susun Caption Informasi
        let caption = `*[ YOUTUBE DOWNLOADER ]*\n\n`
        caption += `*» Judul :* ${metadata.title}\n`
        caption += `*» Tipe :* ${download.type.charAt(0).toUpperCase() + download.type.slice(1).toLowerCase()}\n`
        caption += `*» Kualitas :* ${download.quality}${isAudio ? '' : 'p'}\n\n`
        caption += `*Media sedang dikirim, mohon tunggu sebentar...*`
        //caption += `\n${global.wm}`

        // Kirim detail & thumbnail agar lebih informatif/interaktif
       	if (isAudio) {
    	await conn.sendFile(m.chat, metadata.thumbnail, 'thumb.jpg', caption, m)
		}

        // 6. Pengiriman File Audio / Video
        if (isAudio) {
            // Kirim sebagai audio/mpeg
            await conn.sendMessage(m.chat, { 
                audio: { url: download.url }, 
                mimetype: 'audio/mpeg', 
                fileName: download.filename 
            }, { quoted: m })
        } else {
            // Kirim sebagai video/mp4
            await conn.sendMessage(m.chat, { 
                video: { url: download.url }, 
                mimetype: 'video/mp4', 
                fileName: download.filename,
                caption: `*[ YOUTUBE DOWNLOADER ]*\n\n *» Judul :* ${metadata.title}\n *» Kualitas :* ${download.quality}${isAudio ? '' : 'p'} \n *» Tipe :* ${download.type.charAt(0).toUpperCase() + download.type.slice(1).toLowerCase()}`
            }, { quoted: m })
        }

    } catch (e) {
        console.error("YTDL Error:", e)
        // Kasih info error spesifik jika berbentuk string, jika tidak pakai global.eror
        m.reply(typeof e === 'string' ? `*Gagal:* ${e}` : global.eror)
    }
}

// Metadata Plugin
handler.help = ['ytmp4 <link> [resolusi]', 'ytmp3 <link>', 'ytdl <link>']
handler.tags = ['downloader']
// Command akan aktif jika di depannya ada prefix lalu mengetik ytmp4, ytmp3, ytdl, ytv, atau yta
handler.command = /^(ytmp4|ytmp3|ytdl|ytv|yta)$/i 

// Limit fitur karena download video dan scrape membutuhkan resources lumayan berat
handler.limit = true 

module.exports = handler