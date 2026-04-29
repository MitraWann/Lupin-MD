/**
 * Plugin Pinterest (Search & Downloader)
 * Terintegrasi otomatis berdasarkan deteksi input pengguna (URL / Kata Kunci)
 */

let fetch = require('node-fetch')

let handler = async (m, { conn, text, usedPrefix, command, args, isOwner, isAdmin, isPrems }) => {
    // Validasi input
    if (!text) {
        throw `*Contoh Penggunaan:*\n\n1. *Pencarian:* ${usedPrefix}${command} Go Youn Jung\n2. *Downloader:* ${usedPrefix}${command} https://pin.it/6alasBGbN`
    }

    // Indikator loading
    await m.reply(global.wait)

    // Regex untuk mendeteksi apakah input berupa URL Pinterest
    const isUrl = text.match(/^(https?:\/\/)?(www\.)?(pinterest\.com|pin\.it|pinterest\.co\.[a-z]+)\/.+/i)

    try {
        if (isUrl) {
            // ==========================================
            // LOGIC DOWNLOADER (Jika input berupa URL)
            // ==========================================
            const apiUrl = `https://api.nexray.web.id/downloader/pinterest?url=${encodeURIComponent(text)}`
            const res = await fetch(apiUrl)
            const json = await res.json()

            // Validasi status response
            if (!json.status || !json.result) throw global.eror

            let data = json.result
            
            // Format caption dari title media (karena input berupa URL) menjadi Title Case
            let titleText = data.title || 'Pinterest Media'
            let formattedCaption = titleText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
            let caption = `*${formattedCaption}*`

            // Cek apakah hasilnya berupa video atau hanya gambar
            if (data.video) {
                // Kirim Video
                await conn.sendFile(m.chat, data.video, 'pinterest.mp4', caption, m)
            } else if (data.thumbnail || data.image) {
                // Kirim Gambar jika bukan video
                await conn.sendFile(m.chat, data.image || data.thumbnail, 'pinterest.jpg', caption, m)
            } else {
                throw `Maaf, media tidak dapat ditemukan dari tautan tersebut.`
            }

        } else {
            // ==========================================
            // LOGIC SEARCH (Jika input berupa Kata Kunci)
            // ==========================================
            const apiUrl = `https://api.nexray.web.id/search/pinterest?q=${encodeURIComponent(text)}`
            const res = await fetch(apiUrl)
            const json = await res.json()

            // Validasi status response
            if (!json.status || !json.result || json.result.length === 0) throw `Pencarian tidak ditemukan untuk: *${text}*`

            let data = json.result
            
            // Mengambil secara acak (shuffle) agar hasil tidak monoton setiap kali pencarian yang sama dilakukan
            let shuffled = data.sort(() => 0.5 - Math.random())
            
            // Membatasi hasil maksimal 3 gambar agar tidak spamming di grup/chat
            let limitCount = 5 
            let selected = shuffled.slice(0, limitCount)

            // Format caption dari teks input menjadi Title Case (Huruf pertama kapital)
            let formattedCaption = text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
            let caption = `*${formattedCaption}*`

            for (let i = 0; i < selected.length; i++) {
                // Jeda pengiriman pesan agar terhindar dari pemblokiran spam Baileys
                await sleep(2000)
                
                let item = selected[i]

                await conn.sendFile(m.chat, item.images_url, 'pinterest.jpg', caption, m)
            }
        }
    } catch (e) {
        console.error(e)
        // Jika ada kesalahan atau error dari server, lempar respon error global bot
        throw global.eror
    }
}

// Metadata Plugin
handler.help = ['pinterest'].map(v => v + ' <url/query>')
handler.tags = ['downloader']
handler.command = /^(pinterest)$/i

// Pembatasan akses & penggunaan limit (opsional, disesuaikan dengan ekonomi RPG)
handler.limit = true
handler.register = true // Memastikan user terdaftar (jika diaktifkan)

module.exports = handler

/**
 * Fungsi pembantu (Helper) untuk membuat jeda (delay)
 * Mencegah bot mendadak mengirim banyak media secara bersamaan (Anti Spam)
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}