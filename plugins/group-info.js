let handler = async (m, { conn, participants, groupMetadata }) => {

    // 1. Ambil admin grup dengan cara yang benar untuk Baileys terbaru
    let admins = participants.filter(v => v.admin !== null).map(v => v.id)

    // 2. Ambil foto profil grup dengan aman
    let pp = 'https://telegra.ph/file/3c1ea5866a11088685413.jpg' // Gambar default jika grup tidak ada profil
    try {
        pp = await conn.profilePictureUrl(m.chat, 'image')
    } catch (e) {
        console.log("⚠️ Foto profil grup tidak tersedia, menggunakan gambar default.")
    }

    // 3. Ambil data pengaturan grup dari database
    let chat = global.db.data.chats[m.chat] || {}
    // Menggunakan isMuted sesuai kesepakatan sistem kita sebelumnya
    let { isMuted, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink, expired, descUpdate, stiker } = chat

    // 4. Perbaikan ID Creator (Owner Grup)
    let ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'

    // 5. Deskripsi Grup (Agar tidak error jika deskripsi kosong)
    let desc = groupMetadata.desc?.toString() || 'Tidak ada deskripsi'

    // 6. Menyusun daftar admin
    let listAdmin = admins.map((v, i) => `> ├ ${i + 1}. @${v.split('@')[0]}`).join('\n')

    // 7. Kalkulasi Expired (Sewa)
    let now = new Date() * 1
    let isSewa = expired && expired > now
    let sisaSewa = isSewa ? msToDate(expired - now) : '♾️ Permanen'

    // 8. Menyusun Tampilan (UI) Elegan
    let caption = `🏢 *INFORMASI GRUP* 🏢\n\n` +
                  `> 📛 *Nama:* ${groupMetadata.subject}\n` +
                  `> 🆔 *ID:* ${groupMetadata.id}\n` +
                  `> 👑 *Pembuat:* @${ownerGroup.split('@')[0]}\n` +
                  `> 👥 *Anggota:* ${participants.length} Member\n` +
                  `> ⏳ *Masa Aktif:* ${sisaSewa}\n\n` +
                  `📑 *Deskripsi Grup:*\n` +
                  `${desc}\n\n` +
                  `👮‍♂️ *Daftar Admin:*\n` +
                  `${listAdmin}\n\n` +
                  `⚙️ *Pengaturan Bot di Grup Ini:*\n` +
                  `> ${antiLink ? '✅' : '❌'} Anti Link\n` +
                  `> ${chat.delete === false ? '✅' : '❌'} Anti Delete\n` +
                  `> ${isMuted ? '✅' : '❌'} Bot Bisu (Muted)\n` +
                  `> ${descUpdate ? '✅' : '❌'} Notif Deskripsi\n` +
                  `> ${detect ? '✅' : '❌'} Deteksi\n` +
                  `> ${stiker ? '✅' : '❌'} Auto Stiker\n` +
                  `> ${welcome ? '✅' : '❌'} Pesan Welcome`

    // 9. Kirim Gambar beserta caption
    let mentionsArray = [...admins, ownerGroup]
    
    await conn.sendMessage(m.chat, { 
        image: { url: pp }, 
        caption: caption.trim(), 
        mentions: mentionsArray 
    }, { quoted: m })
}

handler.help = ['infogrup']
handler.tags = ['group']
// Fix Typo Regex dari kode bawaan Boss (Kelebihan tanda kurung)
handler.command = /^(groupinfo|infogroup|infogrup|infogc)$/i 

handler.group = true

module.exports = handler

// Fungsi konversi waktu andalan kita (Lebih bersih)
function msToDate(ms) {
    if (ms <= 0) return 'Expired'
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    
    let res = []
    if (days > 0) res.push(`${days} Hari`)
    if (hours > 0) res.push(`${hours} Jam`)
    if (minutes > 0) res.push(`${minutes} Menit`)
    
    return res.length > 0 ? res.join(' ') : '< 1 Menit'
}