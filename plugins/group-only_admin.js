let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Mengambil database pengaturan bot secara global
    let setting = global.db.data.settings[conn.user.jid]
    if (!setting) {
        global.db.data.settings[conn.user.jid] = {}
        setting = global.db.data.settings[conn.user.jid]
    }

    let cmd = command.toLowerCase()
    let arg1 = args[0] ? args[0].toLowerCase() : ''
    let current = setting.onlyAdmin || false

    // ==========================================
    // LOGIKA PERINTAH: SELFADMIN
    // ==========================================
    if (cmd === 'selfadmin') {
        if (current) {
            setting.onlyAdmin = false
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
            return m.reply('🔴 *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot bisa diakses semua orang')
        }
        setting.onlyAdmin = true
        setting.selfAdmin = false
        setting.publicAdmin = false
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return m.reply(
            '🟢 *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ 🟢 Admin grup\n' +
            '┃ 🟢 Owner bot\n' +
            '┃ 🔴 Member biasa\n' +
            '╰┈┈⬡\n\n' +
            '> Gunakan `' + usedPrefix + 'onlyadmin off` untuk menonaktifkan'
        )
    }

    // ==========================================
    // LOGIKA PERINTAH: PUBLICADMIN
    // ==========================================
    if (cmd === 'publicadmin') {
        if (current) {
            setting.onlyAdmin = false
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
            return m.reply('🔴 *ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot bisa diakses semua orang')
        }
        setting.onlyAdmin = true
        setting.selfAdmin = false
        setting.publicAdmin = false
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return m.reply(
            '🟢 *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ 🟢 Admin grup\n' +
            '┃ 🟢 Owner bot\n' +
            '┃ 🟢 Private chat (semua)\n' +
            '┃ 🔴 Member biasa di grup\n' +
            '╰┈┈⬡\n\n' +
            '> Gunakan `' + usedPrefix + 'onlyadmin off` untuk menonaktifkan'
        )
    }

    // ==========================================
    // LOGIKA PERINTAH UTAMA: ONLYADMIN
    // ==========================================
    if (!arg1 || arg1 === 'status') {
        return m.reply(
            `🔒 *ᴏɴʟʏᴀᴅᴍɪɴ*\n\n` +
            `> Status: ${current ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
            `*Penggunaan:*\n` +
            `> \`${usedPrefix}onlyadmin on\` — Aktifkan\n` +
            `> \`${usedPrefix}onlyadmin off\` — Nonaktifkan\n\n` +
            `_Hanya admin grup, owner, dan private chat yang bisa akses bot_`
        )
    }

    if (arg1 === 'on') {
        if (current) return m.reply('⚠️ OnlyAdmin sudah aktif.')
        setting.onlyAdmin = true
        setting.selfAdmin = false
        setting.publicAdmin = false
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return m.reply(
            '🟢 *ᴏɴʟʏᴀᴅᴍɪɴ ᴀᴋᴛɪꜰ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n' +
            '┃ 🟢 Admin grup\n' +
            '┃ 🟢 Owner bot\n' +
            '┃ 🟢 Private chat (semua)\n' +
            '┃ 🔴 Member biasa di grup\n' +
            '╰┈┈⬡'
        )
    }

    if (arg1 === 'off') {
        if (!current) return m.reply('⚠️ OnlyAdmin sudah nonaktif.')
        setting.onlyAdmin = false
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return m.reply('🔴*ᴏɴʟʏᴀᴅᴍɪɴ ɴᴏɴᴀᴋᴛɪꜰ*\n\n> Bot bisa diakses semua orang')
    }

    return m.reply('❌ Argumen tidak valid. Gunakan: `on` atau `off`')
}

handler.help = ['onlyadmin <on/off>']
handler.tags = ['owner']
handler.command = /^(onlyadmin|adminonly)$/i

// Fitur keamanan (Bawaan framework Boss)
handler.owner = true // Menggantikan isOwner: true agar hanya Owner yang bisa pakai

module.exports = handler