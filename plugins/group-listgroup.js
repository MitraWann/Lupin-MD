const fs = require('fs')
const path = require('path')

let handler = async (m, { conn }) => {
    let now = new Date() * 1

    // Kirim reaksi loading
    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } })

    // ==========================================
    // 1. Fetch Data dari Server WhatsApp
    // ==========================================
    let activeGroups = await conn.groupFetchAllParticipating()
    let activeGroupJids = Object.keys(activeGroups)

    let dbChats = global.db.data.chats || {}
    let groupDataFile = path.join(__dirname, 'info-listgroup.json')
    let groupData = {}

    // 2. Membaca file JSON lokal
    try {
        if (fs.existsSync(groupDataFile)) {
            groupData = JSON.parse(fs.readFileSync(groupDataFile, 'utf-8'))
        }
    } catch (error) {
        console.error("⚠️ Gagal membaca info-listgroup.json", error)
    }

    // 3. Sinkronisasi Data
    for (let jid of activeGroupJids) {
        let groupInfo = groupData[jid] || {}
        let dbGroupInfo = dbChats[jid] || {}

        groupData[jid] = {
            isMuted: groupInfo.isMuted || dbGroupInfo.isMuted || false,
            welcome: groupInfo.welcome || dbGroupInfo.welcome || false,
            antiLink: groupInfo.antiLink || dbGroupInfo.antiLink || false,
            delete: groupInfo.delete !== undefined ? groupInfo.delete : (dbGroupInfo.delete !== undefined ? dbGroupInfo.delete : true),
            detect: groupInfo.detect || dbGroupInfo.detect || false,
            expired: groupInfo.expired || dbGroupInfo.expired || 0,
            descUpdate: groupInfo.descUpdate || dbGroupInfo.descUpdate || false,
            stiker: groupInfo.stiker || dbGroupInfo.stiker || false
        }
    }

    // Simpan pembaruan ke JSON
    fs.writeFileSync(groupDataFile, JSON.stringify(groupData, null, 2))

    // Jika bot tidak tergabung di grup mana pun
    if (activeGroupJids.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        return m.reply('ℹ️ Saat ini bot tidak tergabung di grup mana pun.')
    }

    // 4. Menyusun Tampilan (UI) dengan tambahan ID Grup
    let listItems = activeGroupJids.map((jid, i) => {
        let data = groupData[jid]
        
        // Ambil nama grup langsung dari data fetch server
        let groupName = activeGroups[jid].subject || "Grup Tidak Diketahui" 
        
        let fiturAktif = []
        if (data.isMuted) fiturAktif.push('🔇 Mute')
        if (data.welcome) fiturAktif.push('👋 Welcome')
        if (data.antiLink) fiturAktif.push('🔗 AntiLink')
        if (data.stiker) fiturAktif.push('🖼️ Stiker')
        if (data.detect) fiturAktif.push('🔎 Detect')

        let setStr = fiturAktif.length > 0 ? fiturAktif.join(' | ') : 'Semua Off'
        let expStr = data.expired ? msToDate(data.expired - now) : '♾️ Permanen'

        // Format Output ditambahkan ID
        return `> *${i + 1}. ${groupName}*\n` +
               `> 🆔 ID: ${jid}\n` +
               `> ⏳ Expired: ${expStr}\n` +
               `> ⚙️ Setting: ${setStr}\n`
    })

    // 5. Menggabungkan Semua Teks
    let caption = `🏢 *DAFTAR GRUP BOT*\n\n` +
                  `Total: *${activeGroupJids.length}* Grup Aktif\n\n` +
                  `${listItems.join('\n')}\n` +
                  `_Data disinkronkan secara realtime._`

    await m.reply(caption.trim())
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
}

handler.help = ['grouplist']
handler.tags = ['group']
handler.command = /^(groups|listgroup|grouplist)$/i

module.exports = handler

function msToDate(ms) {
    if (ms <= 0) return 'Expired'
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    
    let res = []
    if (days > 0) res.push(`${days}h`)
    if (hours > 0) res.push(`${hours}j`)
    if (minutes > 0) res.push(`${minutes}m`)
    
    return res.length > 0 ? res.join(' ') : '< 1m'
}