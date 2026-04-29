let { live3dGen } = require('../lib/nanobanana_img-gen')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input
    if (!text) {
        return m.reply(`Masukkan prompt yang ingin dibuat!\n\n*Contoh:*\n${usedPrefix + command} kucing imut lucu sedang tidur`)
    }

    // 2. Tampilkan pesan loading
    m.reply(global.wait)

    try {
        // 3. Eksekusi Scraper
        let imageUrl = await live3dGen(text, '1:1')

        // 4. Kirim media dengan caption
        let caption = `*🎨 NANO BANANA AI*\n\n`
        caption += `*» Prompt :* ${text}\n`
        caption += `*» Model :* nano_banana_pro\n\n`
        caption += `${global.wm}`

        await conn.sendFile(m.chat, imageUrl, 'nanobanana.jpg', caption, m)

    } catch (e) {
        console.error("NanoBanana Error:", e)
        // Kirim notifikasi error global
        m.reply(global.eror)
    }
}

// Metadata Plugin
handler.help = ['nanogenerate <prompt>']
handler.tags = ['ai']
handler.command = /^(nanobananagen|nanogen|bananagen|nanogenerate)$/i

// Pembatasan fitur proporsional
handler.limit = true; // Memakan limit karena melakukan heavy load api
handler.token = 5;

module.exports = handler