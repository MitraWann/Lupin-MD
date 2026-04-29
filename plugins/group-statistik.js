let handler = async (m, { conn, text, args, usedPrefix, command, participants, isOwner, isAdmin }) => {
    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
    if (!chat.memberStats) chat.memberStats = {}

    // ==========================================
    // SISTEM PENDETEKSI HAK AKSES (BULLETPROOF)
    // ==========================================
    // 1. Cek Owner: Memanfaatkan parameter bawaan ATAU mencari kecocokan nomor di global.owner
    let isBotOwner = isOwner || (global.owner || []).some(owner => {
        let number = Array.isArray(owner) ? owner[0] : owner;
        return m.sender.includes(number.toString().replace(/[^0-9]/g, ''));
    });

    // 2. Cek Admin: Memanfaatkan parameter bawaan ATAU format isAdmin/isSuperAdmin khas script Boss
    let userInGroup = participants.find(u => u.id === m.sender) || {};
    let isGrpAdmin = isAdmin || userInGroup.isAdmin || userInGroup.isSuperAdmin || userInGroup.admin === 'admin' || userInGroup.admin === 'superadmin';

    // 3. Gabungan Izin
    let canReset = isBotOwner || isGrpAdmin;

    // ==========================================
    // FITUR 1: .TOPCHAT
    // ==========================================
    if (/^topchat$/i.test(command)) {
        if (args[0] && args[0].toLowerCase() === 'reset') {
            if (!canReset) return m.reply('❌ *Akses Ditolak!*\n\nHanya Admin Grup atau Owner yang bisa mereset data.')
            chat.memberStats = {}
            return m.reply('✅ *DATA TOPCHAT DIRESET!*\n\nPapan peringkat member teraktif di grup ini telah dibersihkan menjadi 0.')
        }

        let stats = Object.entries(chat.memberStats)
            .map(([jid, data]) => ({ jid, ...data }))
            .sort((a, b) => b.chatCount - a.chatCount)
            .slice(0, 10)

        if (stats.length === 0) return m.reply('📉 Belum ada data obrolan yang tercatat di grup ini.')

        let pesan = `🏆 *TOP 10 MEMBER TERAKTIF* 🏆\n`
        pesan += `Grup: *${await conn.getName(m.chat)}*\n\n`
        
        stats.forEach((v, i) => {
            let rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'
            pesan += `${rank} @${v.jid.split('@')[0]} \n   └ 💬 *${v.chatCount}* pesan\n`
        })
        
        pesan += `\n_Ketik ${usedPrefix + command} reset untuk menghapus data._`

        return conn.sendMessage(m.chat, { text: pesan, mentions: stats.map(v => v.jid) }, { quoted: m })
    }

    // ==========================================
    // FITUR 2: .STATISTIKGRUP / .RESETSTATISTIK
    // ==========================================
    if (/^(statistikgrup|statistikgroup|statgrup|statgroup|resetstatistik)$/i.test(command)) {
        if ((args[0] && args[0].toLowerCase() === 'reset') || /^resetstatistik$/i.test(command)) {
            if (!canReset) return m.reply('❌ *Akses Ditolak!*\n\nHanya Admin Grup atau Owner yang bisa mereset data.')
            chat.memberStats = {}
            return m.reply('✅ *STATISTIK GRUP DIRESET!*\n\nSeluruh data analitik grup telah dibersihkan sepenuhnya.')
        }

        let totalMembers = participants.length
        let adminCount = participants.filter(v => v.admin || v.superadmin || v.isAdmin || v.isSuperAdmin).length
        let statsData = Object.values(chat.memberStats)
        
        let totalMessages = statsData.reduce((acc, curr) => acc + curr.chatCount, 0)
        let activeMembers = statsData.length
        let siders = totalMembers - activeMembers

        let pesan = `📊 *STATISTIK GRUP KITA* 📊\n\n`
        pesan += `🏷️ *Nama:* ${await conn.getName(m.chat)}\n`
        pesan += `👥 *Total Member:* ${totalMembers} orang\n`
        pesan += `👮 *Total Admin:* ${adminCount} orang\n`
        pesan += `💬 *Total Pesan:* ${totalMessages} pesan\n`
        pesan += `🔥 *Member Aktif:* ${activeMembers} orang\n`
        pesan += `👻 *Sider:* ${siders > 0 ? siders : 0} orang\n\n`
        pesan += `_Ketik ${usedPrefix}statistikgrup reset untuk mengulang perhitungan._`

        return m.reply(pesan)
    }

    // ==========================================
    // FITUR 3: .INFOMEMBER
    // ==========================================
    if (/^infomember$/i.test(command)) {
        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : ''
        
        if (text && text.toLowerCase().includes('reset')) {
            if (!canReset) return m.reply('❌ *Akses Ditolak!*\n\nHanya Admin Grup atau Owner yang bisa mereset data member.')
            if (!who) return m.reply(`⚠️ Tag member yang ingin direset!\n\n*Contoh:*\n> ${usedPrefix + command} reset @user`)
            
            delete chat.memberStats[who]
            return m.reply(`✅ *DATA MEMBER DIRESET!*\n\nStatistik pesan untuk @${who.split('@')[0]} berhasil dikembalikan ke 0.`, null, { mentions: [who] })
        }

        if (!who) return m.reply(`⚠️ Tag atau balas pesan member yang ingin dicek!\n\n*Contoh:*\n> ${usedPrefix + command} @user`)
        
        let userStats = chat.memberStats[who] || { chatCount: 0, lastSeen: null }
        let username = await conn.getName(who) || 'User'
        let lastSeenDate = userStats.lastSeen ? new Date(userStats.lastSeen).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) : 'Belum pernah chat'
        
        let pesan = `👤 *INFO MEMBER GRUP* 👤\n\n`
        pesan += `📛 *Nama:* ${username}\n`
        pesan += `📱 *Nomor:* @${who.split('@')[0]}\n`
        pesan += `💬 *Pesan di Grup Ini:* ${userStats.chatCount} pesan\n`
        pesan += `⏱️ *Terakhir Chat:* ${lastSeenDate} WITA\n\n`
        pesan += `_Ketik ${usedPrefix}infomember reset @user untuk menghapus data orang ini._`

        return conn.sendMessage(m.chat, { text: pesan, mentions: [who] }, { quoted: m })
    }
}

// ==========================================
// MESIN PELACAK PESAN (BACKGROUND TRACKER)
// ==========================================
handler.before = async function (m) {
    try {
        if (!m.isGroup || m.fromMe || !m.sender) return
        
        let chat = global.db.data.chats[m.chat]
        if (!chat) return
        if (!chat.memberStats) chat.memberStats = {}
        
        if (!chat.memberStats[m.sender]) {
            chat.memberStats[m.sender] = { chatCount: 0, lastSeen: 0 }
        }

        chat.memberStats[m.sender].chatCount += 1
        chat.memberStats[m.sender].lastSeen = Date.now()
    } catch (e) {
        // Silent error
    }
}

// ==========================================
// KONFIGURASI PLUGIN
// ==========================================
handler.help = ['topchat', 'statistikgrup', 'infomember @user']
handler.tags = ['group']
handler.command = /^(topchat|statistikgrup|statistikgroup|statgrup|statgroup|infomember|resetstatistik)$/i
handler.group = true

module.exports = handler