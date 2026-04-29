let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Membaca argumen yang dimasukkan (buka / tutup)
    let isClose = {
        'open': 'not_announcement', 
        'buka': 'not_announcement',
        'on': 'not_announcement',
        '1': 'not_announcement',
        'close': 'announcement',
        'tutup': 'announcement',
        'off': 'announcement',
        '0': 'announcement',
    }[(args[0] || '').toLowerCase()]

    // 2. Jika format salah atau tidak ada argumen
    if (isClose === undefined) {
        let teksPanduan = `⚙️ *PENGATURAN GRUP* ⚙️\n\n` +
                          `Gunakan perintah ini untuk membuka atau menutup akses chat grup.\n\n` +
                          `*Contoh Penggunaan:*\n` +
                          `> 🔓 *${usedPrefix + command} buka* (Semua member bisa chat)\n` +
                          `> 🔒 *${usedPrefix + command} tutup* (Hanya admin yang bisa chat)`
        return m.reply(teksPanduan)
    }

    // 3. Menyiapkan teks respons berdasarkan aksi
    let stateText = isClose === 'announcement' ? '🔒 *GRUP DITUTUP*' : '🔓 *GRUP DIBUKA*'
    let actionText = isClose === 'announcement' 
        ? 'Sekarang *hanya Admin* yang dapat mengirim pesan di grup ini.' 
        : 'Sekarang *seluruh Member* dapat mengirim pesan di grup ini.'

    // 4. Mengeksekusi perubahan pengaturan grup
    try {
        await conn.groupSettingUpdate(m.chat, isClose)
        
        // ==========================================
        // PERBAIKAN 1: FORMAT TAG BERSIH
        // ==========================================
        let tag = `@${m.sender.replace(/@.+/, '')}`

        let teks = `${stateText}\n\n` +
                   `> 👤 *Aksi oleh:* ${tag}\n` +
                   `> 📢 *Status:* ${actionText}\n\n` +
                   `_Ketik ${usedPrefix + command} ${isClose === 'announcement' ? 'buka' : 'tutup'} untuk mengubah status._`

        // ==========================================
        // PERBAIKAN 2: JURUS BOM TAG (DOUBLE PARAMETER)
        // ==========================================
        await conn.sendMessage(m.chat, { 
            text: teks, 
            mentions: [m.sender],
            contextInfo: {
                mentionedJid: [m.sender]
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Gagal mengubah pengaturan grup. Pastikan sistem bot beroperasi normal.')
    }
}

handler.help = ['grup <buka/tutup>']
handler.tags = ['group']
handler.command = /^(group|grup|gc)$/i

handler.group = true
handler.admin = true      
handler.botAdmin = true   

module.exports = handler