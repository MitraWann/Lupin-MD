const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Masukan URL!\n\ncontoh:\n${usedPrefix + command} https://www.facebook.com/share/p/18JhbewbAS/`

    // Validasi ketat Regex untuk berbagai variasi URL Facebook
    if (!/facebook\.com|fb\.watch|fb\.gg|fb\.com/i.test(text)) {
        throw `URL tidak valid. Pastikan itu adalah tautan Facebook yang benar.`
    }

    m.reply('⏳ Lagi diproses...')

    try {
        // Melakukan request ke endpoint API Baguss
        const { data } = await axios.get(`https://api.baguss.xyz/api/download/facebook?url=${encodeURIComponent(text)}`)

        // Pengecekan status success dari JSON
        if (!data.success || !data.data || data.data.length === 0) {
            throw 'Gagal mengambil data dari API atau video diprivasi.'
        }

        // Filter media yang valid (menghindari URL "/" seperti pada kasus audio 320kbps)
        let validMedia = data.data.filter(v => v.url && v.url.startsWith('http'))

        if (validMedia.length === 0) {
            throw 'Tidak ada link media yang valid/dapat diunduh dari postingan ini.'
        }

        // Logika penyortiran kualitas (Mencari resolusi tertinggi)
        let hd1080 = validMedia.find(v => v.quality.includes('1080p'))
        let hd720 = validMedia.find(v => v.quality.includes('720p'))
        let sd = validMedia.find(v => v.quality.includes('360p') || v.quality.includes('SD'))

        // Menentukan final URL dan teks kualitas
        let finalUrl = hd1080 ? hd1080.url : (hd720 ? hd720.url : (sd ? sd.url : validMedia[0].url))
        let qualityText = hd1080 ? '1080p' : (hd720 ? '720p (HD)' : (sd ? '360p (SD)' : validMedia[0].quality))

        // 🔥 PERBAIKAN DI SINI: Unescape HTML entities (&amp; menjadi &)
        finalUrl = finalUrl.replace(/&amp;/g, '&')

        // Mengirimkan hasil video ke User
        await conn.sendMessage(m.chat, {
            video: { url: finalUrl },
            caption: `🎬 *Facebook Video*\n📈 *Kualitas:* ${qualityText}\n\n> _Diunduh menggunakan ${data.creator} API._`
        }, { quoted: m })

    } catch (e) {
        // Menangkap error jika API mati atau request gagal
        console.error(e)
        throw `Terjadi kesalahan saat mengunduh video:\n${e.message || e}`
    }
}

handler.help = ['facebook <link>']
handler.command = /^(facebook|fb)$/i
handler.tags = ['downloader']
handler.limit = true 

module.exports = handler