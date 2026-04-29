/**
 * PLUGIN: GROUP SIDER & CLEANER
 * Fitur: List Sider, Kick Sider, & Reset Sider Data
 */

let handler = async (m, { conn, text, args, groupMetadata }) => {

    const lama = 86400000 * 7 // 7 Hari dalam milidetik
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Makassar" })
    const milliseconds = new Date(now).getTime()

    let member = groupMetadata.participants.map(v => v.id)
    let total = 0
    const sider = []

    // Mendeteksi ID Bot agar tidak ikut terhitung
    const botJid = conn.user.jid || conn.user.id.split(':')[0] + '@s.whatsapp.net'

    for (let i = 0; i < member.length; i++) {
        let jid = member[i]
        let users = groupMetadata.participants.find(u => u.id === jid)
        
        // Melewati (bypass) Bot dan Admin Grup agar aman
        if (jid === botJid || users.admin === 'admin' || users.admin === 'superadmin' || users.isAdmin || users.isSuperAdmin) {
            continue;
        }

        let userDb = global.db.data.users[jid]
        
        // Logika Sider: Masuk daftar jika tidak ada di database ATAU terakhir dilihat (lastseen) lebih dari 7 hari
        if (typeof userDb === 'undefined' || (milliseconds - userDb.lastseen > lama)) {
            total++
            sider.push(jid)
        }
    }

    // Menjadikan 'list' sebagai aksi default jika tidak ada kata tambahan
    let action = args[0] ? args[0].toLowerCase() : 'list'

    // === FITUR 1: SIDER LIST (Default) ===
    if (action === 'list') {
        if (total === 0) return conn.reply(m.chat, `🌟 *LUAR BIASA!*\n\nTidak ada pembaca gelap (sider) di grup ini. Semua member aktif!`, m)
        
        const groupName = await conn.getName(m.chat)
        const message = `👻 *DAFTAR PEMBACA GELAP (SIDER)* 👻\n\n` +
                        `Grup: *${groupName}*\n` +
                        `Terdapat *${total}/${member.length}* member yang pasif lebih dari 7 hari:\n\n` +
                        `${sider.map(v => '  ○ @' + v.replace(/@.+/, '')).join('\n')}\n\n` +
                        `*Opsi Lain:*\n` +
                        `• *.sider kick* (Keluarkan semua)\n` +
                        `• *.sider reset* (Update waktu aktif mereka)`

        return conn.reply(m.chat, message, m, {
            contextInfo: {
                mentionedJid: sider
            }
        })
    }

    // === FITUR 2: SIDER KICK ===
    if (action === 'kick') {
        if (total === 0) return conn.reply(m.chat, `🌟 *Tidak ada sider yang perlu dikeluarkan di grup ini.*`, m)
        
        await conn.reply(m.chat, `⚠️ *MEMULAI PEMBERSIHAN!*\n\nBot akan mengeluarkan *${total} sider* dari grup ini. Mohon tunggu sebentar...`, m)

        for (const user of sider) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
                
                // JEDA AMAN (2 detik per member) agar nomor bot tidak diblokir pihak WhatsApp
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch (e) {
                console.error('Gagal mengeluarkan:', user)
            }
        }

        return conn.reply(m.chat, `✅ *PEMBERSIHAN SELESAI!*\n\nBerhasil mengeluarkan *${total}* pembaca gelap dari grup ini.`, m)
    }

    // === FITUR 3: SIDER RESET (New Feature) ===
    if (action === 'reset') {
        if (total === 0) return conn.reply(m.chat, `🚩 *Data sudah bersih.* Tidak ada sider untuk di-reset.`, m)

        for (const jid of sider) {
            if (global.db.data.users[jid]) {
                global.db.data.users[jid].lastseen = milliseconds
            } else {
                // Jika belum ada di DB, buatkan profil minimalis agar tidak terdeteksi sider lagi
                global.db.data.users[jid] = { lastseen: milliseconds }
            }
        }

        return conn.reply(m.chat, `✅ *RESET BERHASIL*\n\nWaktu terakhir dilihat untuk *${total} member pasif* telah diperbarui ke saat ini. Mereka tidak akan muncul di daftar sider selama 7 hari ke depan.`, m)
    }

    // Jika user salah ketik argumen
    return conn.reply(m.chat, `🚩 Opsi tidak valid.\n\n*Penggunaan:*\n1. *.sider* (Cek list)\n2. *.sider kick* (Tendang)\n3. *.sider reset* (Ampuni/Reset data)`, m)
}

handler.help = ['sider', 'sider kick', 'sider reset']
handler.tags = ['group']
handler.command = /^(sider|gcsider)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true 

module.exports = handler