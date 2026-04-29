let handler = async (m, { conn, text, usedPrefix, command, participants }) => {
    // 1. Inisialisasi Database Grup
    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
    if (!Array.isArray(chat.mutedUsers)) chat.mutedUsers = []

    // 2. Tentukan & Normalisasi Target
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] 
            : m.quoted ? m.quoted.sender 
            : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
            : ''
    
    // Validasi input kosong
    if (!who) return conn.reply(m.chat, `Tag atau balas pesan orang yang ingin dibisukan!\n\n*Contoh:*\n> ${usedPrefix + command} @user`, m)
    
    // [PENTING] Normalisasi Device ID (Mencegah bug Multi-Device WhatsApp)
    who = who.replace(/:\d+/, '') 
    let botJid = conn.user.jid.replace(/:\d+/, '')
    let senderJid = m.sender.replace(/:\d+/, '')

    if (who === botJid) return conn.reply(m.chat, '❌ *Sistem menolak:* Tidak bisa membisukan bot sendiri!', m)
    if (who === senderJid) return conn.reply(m.chat, '❌ *Sistem menolak:* Anda tidak bisa membisukan diri sendiri!', m)

    // ==========================================
    // DETEKSI AKURAT: OWNER & ADMIN GRUP
    // ==========================================
    // Cek Owner (Mendukung format array atau string dari config)
    let isTargetOwner = global.owner.some(v => (v[0] || v).replace(/[^0-9]/g, '') + '@s.whatsapp.net' === who) || who === (global.numberowner + '@s.whatsapp.net')
    
    // Cek Admin
    let groupParticipants = participants || []
    let isTargetAdmin = groupParticipants.some(p => p.id.replace(/:\d+/, '') === who && (p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin))

    // ==========================================
    // EKSEKUSI PERINTAH
    // ==========================================
    let isMuteCmd = /^(bisukan|silence)$/i.test(command)

    if (isMuteCmd) {
        if (isTargetOwner) return conn.reply(m.chat, '👑 *Sistem menolak:* Owner bot memiliki kekebalan mutlak!', m)
        if (isTargetAdmin) return conn.reply(m.chat, '❌ *Sistem menolak:* Admin grup memiliki kekebalan dan tidak bisa dibisukan!', m)

        if (chat.mutedUsers.includes(who)) return conn.reply(m.chat, 'User tersebut sudah dalam keadaan dibisukan di grup ini!', m)
        
        // Masukkan ke daftar mute grup
        chat.mutedUsers.push(who)

        let teks = `🤫 *USER DIBISUKAN*\n\nUser @${who.split('@')[0]} berhasil dibisukan.\nSetiap pesannya di grup ini akan otomatis dihapus oleh sistem.`
        conn.reply(m.chat, teks, m, { contextInfo: { mentionedJid: [who] }})
        
    } else {
        if (!chat.mutedUsers.includes(who)) return conn.reply(m.chat, 'User tersebut tidak dalam keadaan dibisukan!', m)
        
        // Hapus dari daftar mute grup
        chat.mutedUsers = chat.mutedUsers.filter(v => v !== who)

        let teks = `🔊 *USER DIBEBASKAN*\n\nUser @${who.split('@')[0]} sekarang bisa mengirim pesan kembali di grup ini.`
        conn.reply(m.chat, teks, m, { contextInfo: { mentionedJid: [who] }})
    }
}

// ==========================================
// MESIN PENCEGAT ABSOLUT (Berjalan Paling Awal)
// ==========================================
handler.all = async function (m) {
    let conn = this // Memperbaiki TypeError: Mengambil instance conn dari konteks "this"
    if (!m.isGroup || m.fromMe || !m.sender) return

    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.mutedUsers || !Array.isArray(chat.mutedUsers) || chat.mutedUsers.length === 0) return

    // [PENTING] Normalisasi pengirim untuk mendeteksi ID Multi-Device dengan akurat
    let senderNorm = m.sender.replace(/:\d+/, '')

    // Cek apakah pengirim ada dalam daftar bisu (menggunakan ID yang dinormalisasi)
    if (chat.mutedUsers.includes(senderNorm) || chat.mutedUsers.includes(m.sender)) {
        try {
            // Hapus pesan user dengan mendefinisikan Ulang Key secara Spesifik untuk kompatibilitas Baileys
            let deleteKey = {
                remoteJid: m.chat,
                fromMe: false,
                id: m.key.id,
                participant: m.key.participant || m.sender
            }

            await conn.sendMessage(m.chat, { delete: deleteKey })
        } catch (e) {
            console.error("[Silence Plugin] Gagal menghapus pesan user bisu (Pastikan bot adalah Admin):", e)
        }
        
        // Perlindungan ganda: kosongkan teks agar tidak memicu perintah bot apapun
        m.text = '' 
        m.isCommand = false
    }
}

// ==========================================
// KONFIGURASI PLUGIN
// ==========================================
handler.help = ['silence @user', 'unsilence @user']
handler.tags = ['group']
handler.command = /^(bisukan|bunyikan|silence|unsilence)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true // Memastikan Bot WAJIB admin untuk menjalankan perintah ini

module.exports = handler