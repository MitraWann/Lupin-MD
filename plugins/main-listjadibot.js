/**
 * Plugin: List Jadibot
 * Deskripsi: Menampilkan daftar semua user yang sedang menumpang (Jadibot) secara real-time.
 * Author: Senior WhatsApp Bot Developer
 */

let handler = async (m, { conn, usedPrefix }) => {
    // Mengambil daftar koneksi dari array global yang didefinisikan di jadibot.js
    let users = [...new Set([...global.conns.filter(conn => conn.user && conn.state !== 'close').map(conn => conn.user.jid)])]
    
    if (users.length === 0) {
        return m.reply(`*INFO:* Tidak ada sesi jadibot yang aktif saat ini.\nKetik *${usedPrefix}jadibot* untuk mendaftar.`)
    }

    let caption = `*─[ LIST JADIBOT AKTIF ]─*\n\n`
    caption += `Total: *${users.length}* Bot Terhubung\n\n`
    
    let list = users.map((v, i) => {
        let username = conn.getName(v)
        return `${i + 1}. @${v.split('@')[0]}`
    }).join('\n')

    // Mengirim pesan dengan mention agar user bisa diklik
    await conn.sendMessage(m.chat, {
        text: caption + list,
        mentions: users
    }, { quoted: m })
}

handler.help = ['listjadibot']
handler.tags = ['main']
handler.command = /^(listjadibot|ljb|listbot)$/i

module.exports = handler