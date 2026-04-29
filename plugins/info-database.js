let handler = async (m, { conn }) => {
    // 1. Ambil semua data user dari database
    let users = Object.entries(global.db.data.users)
    
    // 2. Filter hanya user yang statusnya registered: true
    let registeredUsers = users.filter(([jid, user]) => user.registered)
    
    // 3. Batasi tampilan agar pesan tidak terlalu panjang (Maksimal 100 orang)
    let limit = 100
    let displayedUsers = registeredUsers.slice(0, limit)
    
    // 4. Susun daftar teksnya
    let listTxt = displayedUsers.map(([jid, user], i) => {
        // NORMALISASI: Hapus Device ID untuk mencegah tag yang rusak
        let normalizedJid = jid.replace(/:\d+/, '')
        let number = normalizedJid.split('@')[0]
        
        let name = user.name || 'Tanpa Nama'
        let age = user.age ? `${user.age} thn` : ''
        
        let detail = age ? `_(${name} - ${age})_` : `_(${name})_`
        
        return `> *${i + 1}.* @${number} ${detail}`
    }).join('\n')

    // 5. Susun tata letak pesan utama
    let teks = `🗃️ *DATABASE PENGGUNA* 🗃️\n\n` +
               `> 👥 Total Pengguna: *${users.length}* user\n` +
               `> ✅ Teregistrasi: *${registeredUsers.length}* user\n\n` +
               `📋 *Daftar User Terdaftar:*\n` +
               (listTxt.length > 0 ? listTxt : '> _Belum ada user yang terdaftar._')

    // 6. Tambahkan keterangan jika jumlah user melebihi limit tampilan
    if (registeredUsers.length > limit) {
        teks += `\n> \n> _...dan ${registeredUsers.length - limit} user lainnya disembunyikan._`
    }

    // 7. Kumpulkan semua JID yang ditampilkan dan normalisasi agar tag (@nomor) berfungsi
    let mentionsArray = displayedUsers.map(([jid]) => jid.replace(/:\d+/, ''))

    // 8. Kirim pesan menggunakan struktur contextInfo (lebih stabil untuk tag di Baileys)
    conn.reply(m.chat, teks, m, { contextInfo: { mentionedJid: mentionsArray } })
}

handler.help = ['database', 'user']
handler.tags = ['info']
handler.command = /^(database|jumlahdatabase|user)$/i

module.exports = handler