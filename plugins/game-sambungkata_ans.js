const { sKata, cKata } = require('../lib/sambung-kata')

let handler = m => m

handler.before = async function (m, { conn }) {
    conn.skata = conn.skata ? conn.skata : {}
    let id = m.chat
    
    if (!(id in conn.skata)) return true
    if (!m.text) return true

    let room = conn.skata[id]
    let users = global.db.data.users
    let member = room.player
    let bonus = rwd(500, 600)
    
    function mmr(type, jid) {
        let user = users[jid]
        if (type === 'win') {
            return user.skata > 5000 ? rwd(5, 9) : user.skata > 3000 ? rwd(5, 10) : user.skata > 1500 ? rwd(10, 15) : user.skata > 1000 ? rwd(15, 20) : user.skata > 500 ? rwd(20, 30) : rwd(30, 50)
        } else {
            return user.skata > 8000 ? rwd(35, 50) : user.skata > 5000 ? rwd(25, 30) : user.skata > 3000 ? rwd(20, 25) : user.skata > 1500 ? rwd(15, 19) : user.skata > 1000 ? rwd(10, 14) : user.skata > 500 ? rwd(5, 9) : rwd(1, 5)
        }
    }

    if (room.curr == m.sender) {
        let textClean = m.text.toLowerCase().trim()
        
        if (/nyerah/i.test(textClean)) {
            let lose_skata = mmr('lose', room.curr)
            let win_skata = room.killer ? mmr('win', room.killer) : 0
            users[room.curr].skata -= lose_skata
            if (room.killer) users[room.killer].skata += win_skata
            
            room.eliminated.push(room.curr)
            room.player = room.player.filter(p => p !== room.curr)
            
            let tagSender = `@${m.sender.replace(/@.+/, '')}`
            await conn.sendMessage(m.chat, {
                text: `🏳️ ${tagSender} telah menyerah!`,
                mentions: [m.sender],
                contextInfo: { mentionedJid: [m.sender] }
            })

            // Cek jika tersisa 1 orang
            if (room.player.length == 1) {
                users[room.player[0]].exp += room.win_point
                let tagWin = `@${room.player[0].replace(/@.+/, '')}`
                await conn.sendMessage(m.chat, {
                    text: `🏆 *GAME BERAKHIR*\n\n${tagWin} Berhasil bertahan dan Menang!\n🎁 Hadiah: +${room.win_point} XP`,
                    mentions: [room.player[0]],
                    contextInfo: { mentionedJid: [room.player[0]] }
                })
                clearTimeout(room.waktu) // PERBAIKAN: JANGAN LUPA MATIKAN BOM WAKTU
                delete conn.skata[id]
                return true
            }
            
            room.curr = room.player[0]
            let _kata = await room.genKata()
            room.kata = _kata
            room.basi = []
            
            let tagNext = `@${room.curr.replace(/@.+/, '')}`
            room.chat = await conn.sendMessage(m.chat, {
                text: `Lanjut! Giliran ${tagNext}\nMulai : *${_kata.toUpperCase()}*\n*${room.filter(_kata).toUpperCase()}... ?*\n\n_Jawab dengan mengetik langsung!_\n_"nyerah" untuk menyerah_`,
                mentions: member,
                contextInfo: { mentionedJid: member }
            })
            
            room.timer()
            return true
        }
        
        let answerF = textClean.replace(/[^a-z]/gi, '')
        if (!answerF) return true
        
        let checkF = await cKata(textClean.split(' ')[0])
        
        if (!answerF.startsWith(room.filter(room.kata)) || !checkF.status || room.basi.includes(answerF)) {
            return m.reply(`👎 *SALAH!*\nJawaban tidak valid, tidak ada di kamus, atau sudah pernah digunakan!`)
        }
        
        users[m.sender].exp += bonus
        room.basi.push(answerF)
        room.win_point += 200
        room.kata = answerF
        
        let nextIndex = (room.player.indexOf(room.curr) + 1) % room.player.length
        room.curr = room.player[nextIndex]
        
        let tagNext = `@${room.curr.replace(/@.+/, '')}`
        room.chat = await conn.sendMessage(m.chat, {
            text: `👍 *BENAR!* +${bonus} XP\n\nGiliran ${tagNext}\n*${room.filter(answerF).toUpperCase()}... ?*\n\n_Jawab dengan mengetik langsung!_\n_"nyerah" untuk menyerah_`,
            mentions: member,
            contextInfo: { mentionedJid: member }
        }, { quoted: m })
        
        room.timer()
        
    } else {
        if (room.status === 'play') {
            if (room.eliminated.includes(m.sender)) {
                return m.reply(`Kamu sudah tereliminasi, tunggu game berikutnya!`)
            } else if (member.includes(m.sender)) {
                return m.reply(`_Sabar, ini bukan giliranmu!_`)
            }
        }
    }
    return true
}

module.exports = handler

function rwd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}