let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Jika teks kosong, tampilkan panduan interaktif
    if (!text) {
        let teksPanduan = `⚠️ *FORMAT SALAH!*\n\n` +
                          `Silakan masukkan teks pesan sambutan yang baru.\n\n` +
                          `*Variabel Ajaib yang bisa digunakan:*\n` +
                          `> *@user* : Untuk memanggil/tag member yang baru masuk\n` +
                          `> *@subject* : Untuk menampilkan nama grup ini\n` +
                          `> *@desc* : Untuk menampilkan deskripsi grup\n\n` +
                          `*Contoh Penggunaan:*\n` +
                          `> ${usedPrefix + command} Halo @user! 👋 Selamat datang di grup @subject.`
        
        return m.reply(teksPanduan)
    }

    // 2. Simpan teks ke database
    global.db.data.chats[m.chat].sWelcome = text

    // 3. Merakit Preview dengan Tag Biru (Bom Tag)
    let tagUser = `@${m.sender.replace(/@.+/, '')}`
    let preview = text.replace(/@user/g, tagUser)
                      .replace(/@subject/g, (await conn.getName(m.chat)))
                      .replace(/@desc/g, (await conn.groupMetadata(m.chat)).desc?.toString() || '-')

    let teksSukses = `✅ *PESAN WELCOME DIPERBARUI*\n\n` +
                     `*Preview Pesan (Contoh ke Anda):*\n` +
                     `------------------------------------------\n` +
                     `${preview}`

    // Mengirim preview dengan Bom Tag agar @user di preview jadi biru
    await conn.sendMessage(m.chat, { 
        text: teksSukses, 
        mentions: [m.sender],
        contextInfo: { mentionedJid: [m.sender] } 
    }, { quoted: m })
}

handler.help = ['setwelcome <teks>']
handler.tags = ['group']
handler.command = /^(setwelcome|setpesanwelcome)$/i

handler.group = true
handler.admin = true 

module.exports = handler