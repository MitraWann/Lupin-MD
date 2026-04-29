/**
 * Plugin: info-boost.js
 * Feature: Progress Bar Animation using Message Edit
 */

let { performance } = require('perf_hooks')

// Fungsi delay untuk jeda antar edit
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
    
    // Kirim pesan pertama dan simpan object key-nya
    let msg = await conn.sendMessage(m.chat, { text: '⚡ _Inisialisasi proses boosting..._' }, { quoted: m })
    let key = msg.key

    // Frame animasi progres bar
    let frames = [
        "▱▱▱▱▱▱▱▱▱▱ 0%",
        "▰▱▱▱▱▱▱▱▱▱ 10%",
        "▰▰▱▱▱▱▱▱▱▱ 20%",
        "▰▰▰▱▱▱▱▱▱▱ 30%",
        "▰▰▰▰▱▱▱▱▱▱ 40%",
        "▰▰▰▰▰▱▱▱▱▱ 50%",
        "▰▰▰▰▰▰▱▱▱▱ 60%",
        "▰▰▰▰▰▰▰▱▱▱ 70%",
        "▰▰▰▰▰▰▰▰▱▱ 80%",
        "▰▰▰▰▰▰▰▰▰▱ 90%",
        "▰▰▰▰▰▰▰▰▰▰ 100%"
    ]

    // Looping untuk mengedit pesan sesuai frame
    for (let i = 0; i < frames.length; i++) {
        await delay(200) // Jeda 200ms setiap perubahan
        await conn.sendMessage(m.chat, { 
            text: `🚀 *SYSTEM BOOSTING*\n\nProgress:\n${frames[i]}`, 
            edit: key 
        })
    }

    // Kalkulasi fake/micro ping seperti kode orisinalnya
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    let finish = `*Proses Boost Selesai!*\n\n🚀 Bot telah dipercepat hingga:\n*${speed}* milidetik!`
    
    // Edit pesan untuk hasil akhir
    await delay(300)
    await conn.sendMessage(m.chat, { text: finish, edit: key })
}

handler.help = ['boost', 'refresh']
handler.tags = ['info']
handler.command = /^(boost|refresh)$/i
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.fail = null

module.exports = handler