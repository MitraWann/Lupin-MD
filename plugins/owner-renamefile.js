const fs = require('fs')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Memecah teks berdasarkan tanda pemisah '|'
    let [oldPath, newPath] = text.split('|').map(v => v?.trim())

    if (!oldPath || !newPath) {
        return m.reply(
            `⚠️ *Format Salah!*\n\n` +
            `Masukkan lokasi file lama dan nama file baru, pisahkan dengan tanda *|* (Garis Lurus).\n\n` +
            `*Contoh Penggunaan:*\n` +
            `> ${usedPrefix + command} plugins/lama.js | plugins/baru.js`
        )
    }

    try {
        if (!fs.existsSync(oldPath)) {
            return m.reply(`⛔ *File Tidak Ditemukan!*\n\nFile sumber \`${oldPath}\` tidak ada di sistem.`)
        }

        // Mencegah Boss menimpa file penting yang secara kebetulan namanya sama
        if (fs.existsSync(newPath)) {
            return m.reply(`⚠️ *Nama Bentrok!*\n\nFile dengan nama \`${newPath}\` sudah ada. Silakan gunakan nama lain.`)
        }

        // Eksekusi perubahan nama / pemindahan file
        fs.renameSync(oldPath, newPath)

        let suksesMsg = `📝 *FILE BERHASIL DI-RENAME* 📝\n\n` +
                        `> 📁 *Lama:* \`${oldPath}\`\n` +
                        `> 📂 *Baru:* \`${newPath}\`\n\n` +
                        `_Nama/lokasi file berhasil diperbarui._`

        m.reply(suksesMsg)

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Gagal mengubah nama file!*\n\n\`${e.message}\``)
    }
}

handler.help = ['renamefile <old|new>']
handler.tags = ['owner']
handler.command = /^(renamefile|rn|ubahnamalife)$/i
handler.rowner = true // Mutlak hanya untuk Boss

module.exports = handler