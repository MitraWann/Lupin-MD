const simple = require('./lib/simple')
const util = require('util')

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    async handler(chatUpdate) {
        if (global.db.data == null) await loadDatabase()
        this.msgqueque = this.msgqueque || []
        
        if (!chatUpdate) return
        if (chatUpdate.messages.length > 1) console.log(chatUpdate.messages)
        let m = chatUpdate.messages[chatUpdate.messages.length - 1]
        if (!m) return
        
        try {
            m = simple.smsg(this, m) || m
            if (!m) return
            
            m.exp = 0
            m.limit = false
            m.token = false 
            
            try {
                let user = global.db.data.users[m.sender]
                if (typeof user !== 'object') global.db.data.users[m.sender] = {}
                if (user) {
                    if (!isNumber(user.saldo)) user.saldo = 0
                    if (!isNumber(user.pengeluaran)) user.pengeluaran = 0
                    if (!isNumber(user.energi)) user.energi = 100
                    if (!isNumber(user.title)) user.title = 0
                    if (!isNumber(user.level)) user.level = 0
                    if (!('pasangan' in user)) user.pasangan = ''
                    if (!('location' in user)) user.location = 'Gubuk'
                    if (!isNumber(user.follow)) user.follow = 0
                    if (!isNumber(user.followers)) user.followers = 0
                    if (!isNumber(user.exp)) user.exp = 0
                    if (!isNumber(user.pc)) user.pc = 0
                    if (!isNumber(user.ojek)) user.ojek = 0
                    if (!isNumber(user.pedagang)) user.pedagang = 0
                    if (!isNumber(user.dokter)) user.dokter = 0
                    if (!isNumber(user.montir)) user.montir = 0
                    if (!isNumber(user.kuli)) user.kuli = 0
                    if (!isNumber(user.coin)) user.coin = 0
                    if (!isNumber(user.limit)) user.limit = 100
                    if (!isNumber(user.token)) user.token = 10 
                    if (!isNumber(user.lastkerja)) user.lastkerja = 0
                    if (!isNumber(user.money)) user.money = 0
                    if (!isNumber(user.poin)) user.poin = 0
                    if (!isNumber (user.bank)) user.bank = 0
                    if (!isNumber (user.balance)) user.balance = 0
                    if (!isNumber(user.warn)) user.warn = 0
                    if (!('banned' in user)) user.banned = false
                    if (!isNumber(user.bannedTime)) user.bannedTime = 0
                    if (!isNumber(user.afk)) user.afk = -1
                    if (!'afkReason' in user) user.afkReason = ''
                    if (!isNumber(user.antispam)) user.antispam = 0
                    if (!isNumber(user.lastngojek)) user.lastngojek = 0
                    if (!isNumber(user.lastseen)) user.lastseen = 0
                    if (!('registered' in user)) user.registered = false
                    
                    if (!user.registered) {
                        if (!('name' in user)) user.name = this.getName(m.sender)
                        if (!isNumber(user.skata)) user.skata = 0
                        if (!isNumber(user.age)) user.age = -1
                        if (!isNumber(user.regTime)) user.regTime = -1
                        if (!isNumber(user.level)) user.level = 0
                        if (!user.job) user.job = 'Pengangguran'
                        if (!user.premium) user.premium = false
                        if (!user.premiumTime) user.premiumTime= 0
                        if (!user.role) user.role = 'Newbie ㋡'
                        if (!('autolevelup' in user)) user.autolevelup = true
                        if (!isNumber(user.lasttaxi)) user.lasttaxi = 0
                        if (!isNumber(user.taxi)) user.taxi = 0;
                    } 
                } else {
                    global.db.data.users[m.sender] = {
                        taxi: 0, lasttaxi: 0, saldo: 0, level: 0, location: 'Gubuk', pc : 0, exp: 0, limit: 100, token: 10, skata: 0, lastkerja: 0, money: 0, poin: 0, balance: 0, ojek: 0, pedagang: 0, dokter: 0, petani: 0, montir: 0, kuli: 0, banned: false, bannedTime: 0, warn: 0, afk: -1, afkReason: '', antispam: 0, lastngojek: 0, lastseen: 0, registered: false, name: this.getName(m.sender), age: -1, regTime: -1, premium: false, premiumTime: 0, job: 'Pengangguran', role: 'Newbie ㋡', autolevelup: true,
                    }
                }

                let chat = global.db.data.chats[m.chat]
                if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
                if (chat) {
                    if (!('isBanned' in chat)) chat.isBanned = false
                    if (!('welcome' in chat)) chat.welcome = true
                    if (!('detect' in chat)) chat.detect = false
                    if (!('mute' in chat)) chat.mute = false
                    if (!('listStr' in chat)) chat.listStr = {}
                    if (!('sWelcome' in chat)) chat.sWelcome = 'Hai, @user!\nSelamat datang di grup @subject\n\n@desc'
                    if (!('sBye' in chat)) chat.sBye = 'Selamat tinggal @user!'
                    if (!('sPromote' in chat)) chat.sPromote = ''
                    if (!('sDemote' in chat)) chat.sDemote = ''
                    if (!('delete' in chat)) chat.delete = true
                    if (!('antiLink' in chat)) chat.antiLink = true
                    if (!('antiSticker' in chat)) chat.antiSticker = false
                    if (!('viewonce' in chat)) chat.viewonce = false
                    if (!('antiToxic' in chat)) chat.antiToxic = false
                    if (!isNumber(chat.expired)) chat.expired = 0
                    if (!('antibot' in chat)) chat.antibot = false
                    if (!("rpg" in chat)) chat.rpg = false;
                    if (!("nsfw" in chat)) chat.nsfw = false;
                } else {
                    global.db.data.chats[m.chat] = {
                        isBanned: false, welcome: true, detect: false, mute: false, listStr: {}, sWelcome: 'Hai, @user!\nSelamat datang di grup @subject\n\n@desc', sBye: 'Selamat tinggal @user!', sPromote: '', sDemote: '', delete: false, antiLink: false, antiSticker: false, viewonce: false, antiToxic: false, antibot: false, rpg: false,
                    }
                }

                let memgc = global.db.data.chats[m.chat]?.memgc?.[m.sender];
                if (typeof memgc !== 'object' || memgc === null) {
                    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
                    global.db.data.chats[m.chat].memgc = global.db.data.chats[m.chat].memgc || {};
                    global.db.data.chats[m.chat].memgc[m.sender] = {};
                    memgc = global.db.data.chats[m.chat].memgc[m.sender];
                }
                
                if (memgc) {
                    if (!('blacklist' in memgc)) memgc.blacklist = false;
                    if (!('banned' in memgc)) memgc.banned = false;
                    if (!isNumber(memgc.bannedTime)) memgc.bannedTime = 0;
                    if (!isNumber(memgc.chat)) memgc.chat = 0;
                    if (!isNumber(memgc.chatTotal)) memgc.chatTotal = 0;
                    if (!isNumber(memgc.command)) memgc.command = 0;
                    if (!isNumber(memgc.commandTotal)) memgc.commandTotal = 0;
                    if (!isNumber(memgc.lastseen)) memgc.lastseen = 0;
                } else {
                    global.db.data.chats[m.chat].memgc[m.sender] = {
                        blacklist: false, banned: false, bannedTime: 0, chat: 0, chatTotal: 0, command: 0, commandTotal: 0, lastseen: 0
                    };
                }
            } catch (e) {
                console.error('Error DB Init:', e);
            }
            
            if (opts['nyimak']) return
            if (!m.fromMe && opts['self']) return
            if (opts['pconly'] && m.chat.endsWith('g.us')) return
            if (opts['gconly'] && !m.chat.endsWith('g.us')) return
            if (opts['swonly'] && m.chat !== 'status@broadcast') return
            if (typeof m.text !== 'string') m.text = ''
            
            // FIX: Mengurangi extreme bottleneck dari queue yang menyebabkan WhatsApp timeout/disconnect
            if (opts['queque'] && m.text) {
                this.msgqueque.push(m.id || m.key.id)
                // Membatasi maksimal delay 5 detik agar koneksi websocket tidak timeout
                let queueDelay = Math.min(this.msgqueque.length * 500, 5000); 
                await delay(queueDelay)
            }
            
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!plugin.all) continue
                if (typeof plugin.all !== 'function') continue
                try {
                    await plugin.all.call(this, m, chatUpdate)
                } catch (e) {
                    if (typeof e === 'string') continue
                    console.error('Error Plugin All:', e)
                }
            }
            
	        if (m.id.startsWith('3EB0') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.isBaileys && m.fromMe)) return;	
            m.exp += Math.ceil(Math.random() * 10)

            let usedPrefix
            let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

            // FIX: Menggunakan this.getJid (atau menghapus pengecekan yang tidak aman jika tidak exist)
            let isROwner = [this.user.jid, ...global.owner]
              .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
              .includes(
                m.sender.endsWith('@lid') && typeof this.getJid === 'function'
                  ? this.getJid(m.sender)?.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
                  : m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
              );
              
            let isOwner = isROwner || m.fromMe
            let isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
            let isPrems = isROwner || (db.data.users[m.sender]?.premiumTime > 0 || db.data.users[m.sender]?.premium)
           
            const groupMetadata = (m.isGroup ? (this.chats?.[m.chat] || {}).metadata || (await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
            const participants = (m.isGroup ? groupMetadata.participants : []) || [];

            const user = participants.find((u) => (u.jid || u.phoneNumber || u.id) === m.sender) || {};
            const bot  = participants.find((u) => (u.jid || u.phoneNumber || u.id) === this.user.jid) || {};

            const isRAdmin    = user?.admin === 'superadmin' || false;
            const isAdmin     = isRAdmin || user?.admin === 'admin' || false;
            const isBotAdmin  = bot?.admin === 'admin' || bot?.admin === 'superadmin' || false;
            
            for (let name in global.plugins) {
                let plugin = global.plugins[name]
                if (!plugin) continue
                if (plugin.disabled) continue
                if (!opts['restrict']) if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
                const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                // FIX: Menangani kasus prefix global
                let defaultPrefix = typeof global.prefix !== 'undefined' ? global.prefix : /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/i;
                let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : defaultPrefix
                
                let match = (_prefix instanceof RegExp ? 
                    [[_prefix.exec(m.text), _prefix]] :
                    Array.isArray(_prefix) ? 
                        _prefix.map(p => {
                            let re = p instanceof RegExp ? 
                                p :
                                new RegExp(str2Regex(p))
                            return [re.exec(m.text), re]
                        }) :
                        typeof _prefix === 'string' ? 
                            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                            [[[], new RegExp]]
                ).find(p => p[1])
                
                if (typeof plugin.before === 'function') if (await plugin.before.call(this, m, {
                    match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate,
                })) continue
                
                if (typeof plugin !== 'function') continue
                
                if ((usedPrefix = (match[0] || '')[0])) {
                    let noPrefix = m.text.replace(usedPrefix, '')
                    let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                    args = args || []
                    let _args = noPrefix.trim().split` `.slice(1)
                    let text = _args.join` `
                    command = (command || '').toLowerCase()
                    let fail = plugin.fail || global.dfail 
                    
                    let isAccept = plugin.command instanceof RegExp ? 
                        plugin.command.test(command) :
                        Array.isArray(plugin.command) ? 
                            plugin.command.some(cmd => cmd instanceof RegExp ? 
                                cmd.test(command) :
                                cmd === command
                            ) :
                            typeof plugin.command === 'string' ? 
                                plugin.command === command :
                                false

                    if (!isAccept) continue
                    m.plugin = name
                    
                    if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                        let chat = global.db.data.chats[m.chat]
                        let user = global.db.data.users[m.sender]
                        if (name != 'group-modebot.js' && name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && (chat?.isBanned || chat?.mute))
                        return
                        if (name != 'unbanchat.js' && chat && chat.isBanned) return 
                        if (name != 'unbanuser.js' && user && user.banned) return
                        if (m.isGroup) {
                            if (chat?.memgc?.[m.sender]) {
                                chat.memgc[m.sender].command++
                                chat.memgc[m.sender].commandTotal++
                                chat.memgc[m.sender].lastCmd = Date.now()
                            }
                        }
                        if (user) {
                            user.command++
                            user.commandTotal++
                            user.lastCmd = Date.now()
                        }
                    }
                    
                    if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.rowner && !isROwner) { 
                        fail('rowner', m, this)
                        continue
                    }
                    if (plugin.owner && !isOwner) { 
                        fail('owner', m, this)
                        continue
                    }
                    if (plugin.mods && !isMods) { 
                        fail('mods', m, this)
                        continue
                    }
                    if (plugin.premium && !isPrems) { 
                        fail('premium', m, this)
                        continue
                    }
                    if (plugin.group && !m.isGroup) { 
                        fail('group', m, this)
                        continue
                    } else if (plugin.botAdmin && !isBotAdmin) { 
                        fail('botAdmin', m, this)
                        continue
                    } else if (plugin.admin && !isAdmin) { 
                        fail('admin', m, this)
                        continue
                    }
                    if (plugin.private && m.isGroup) { 
                        fail('private', m, this)
                        continue
                    }
                    if (plugin.register == true && _user?.registered == false) { 
                        fail('unreg', m, this)
                        continue
                    }
                    if (plugin.rpg && !global.db.data.chats[m.chat]?.rpg) {
                        fail("rpg", m, this);
                        continue;
                    }
                    if (plugin.nsfw && !global.db.data.chats[m.chat]?.nsfw) {
                        fail("nsfw", m, this);
                        continue;
                    }

                    m.isCommand = true
                    let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
                    if (xp > 200) m.reply('Ngecit -_-') 
                    else m.exp += xp

                    if (!isPrems && plugin.limit && global.db.data.users[m.sender]?.limit < plugin.limit * 1) {
                        this.reply(m.chat, `Limit anda habis, silahkan beli melalui *${usedPrefix}buy* atau beli di *${usedPrefix}shop*`, m)
                        continue 
                    }

                    if (!isOwner && plugin.token && global.db.data.users[m.sender]?.token < plugin.token * 1) {
                        fail('token', m, this)
                        continue 
                    }

                    if (plugin.level > _user?.level) {
                        this.reply(m.chat, `diperlukan level ${plugin.level} untuk menggunakan perintah ini. Level kamu ${_user.level}\m gunakan .levelup untuk menaikan level!`, m)
                        continue 
                    }

                    let extra = {
                        match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate,
                    }                          
                    try {
                        await plugin.call(this, m, extra)
                        if (!isPrems) m.limit = m.limit || plugin.limit || false
                        if (!isOwner) m.token = m.token || plugin.token || false 
                    } catch (e) {
                        m.error = e
                        console.error(e)
                        if (e) {
                            let text = util.format(e)
                            // Menyembunyikan apikey jika ada
                            if (typeof APIKeys !== 'undefined') {
                                for (let key of Object.values(APIKeys))
                                    text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                            }
                            if (e.name) {
                                let owners = global.owner || []
                                for (let jid of owners.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != this.user.jid)) {
                                    let data = (await this.onWhatsApp(jid))[0] || {}
                                    if (data.exists)
                                        console.error(`Error on Plugin:${m.plugin} | Error: ${text}`)
                                }
                            }
                            m.reply(text)
                        }
                    } finally {
                        if (typeof plugin.after === 'function') {
                            try {
                                await plugin.after.call(this, m, extra)
                            } catch (e) {
                                console.error(e)
                            }
                        }
                        if (m.limit) m.reply(+ m.limit + ' Limit terpakai')
                        if (m.token) m.reply(+ m.token + ' Token terpakai') 
                   }
                    break
                }
            }
        } catch (e) {
            console.error('Fatal Handler Error:', e)
        } finally {
            let user, stats = global.db.data.stats
            if (m) {
                if (m.sender && (user = global.db.data.users[m.sender])) {
                    user.exp += m.exp
                    user.limit -= m.limit * 1
                    user.token -= m.token * 1 
                }

                let stat
                if (m.plugin) {
                    let now = + new Date
                    if (m.plugin in stats) {
                        stat = stats[m.plugin]
                        if (!isNumber(stat.total)) stat.total = 1
                        if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                        if (!isNumber(stat.last)) stat.last = now
                        if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                    } else stat = stats[m.plugin] = {
                        total: 1, success: m.error != null ? 0 : 1, last: now, lastSuccess: m.error != null ? 0 : now
                    }
                    stat.total += 1
                    stat.last = now
                    if (m.error == null) {
                        stat.success += 1
                        stat.lastSuccess = now
                    }
                }
            }

            try {
                 require('./lib/print')(m, this)
             } catch (e) {
                 // console.log(m, m.quoted, e)
             }
            if (opts['autoread']) await this.readMessages([m.key]).catch(() => {})
        }
    },
	
  async participantsUpdate({ id, participants, action }) {
    // FIX: Dibungkus dengan try-catch agar tidak menyebabkan unhandled promise crash
    try {
        if (opts['self']) return
        if (global.isInit) return

        let chat = db.data?.chats?.[id] || {}
        let text = ''

        switch (action) {
            case 'add':
            case 'remove':
            case 'leave':
            case 'invite':
            case 'invite_v4':
                if (chat.welcome) {
                    let groupMetadata = await this.groupMetadata(id).catch(() => null)
                    if (!groupMetadata) break

                    for (let user of participants) {
                        let jid = user
                        if (typeof user === 'object') {
                            jid = user.phoneNumber || user.id || user.jid || user
                        }
                        if (!jid || (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid'))) continue

                        let pp = 'https://telegra.ph/file/70e8de9b1879568954f09.jpg'
                        try { pp = await this.profilePictureUrl(jid, 'image') } catch {}

                        const isAdd = ['add', 'invite', 'invite_v4'].includes(action)

                        // FIX: Mengganti conn.welcome menjadi this.welcome (karena berada di dalam binding socket)
                        let fallbackWelcome = (this.welcome || 'Welcome, @user!')
                        let fallbackBye = (this.bye || 'Bye, @user!')

                        text = (isAdd
                            ? (chat.sWelcome || fallbackWelcome)
                            : (chat.sBye || fallbackBye))
                            .replace('@subject', groupMetadata.subject || 'this group')
                            .replace('@desc', groupMetadata.desc?.toString() || '')
                            .replace('@user', '@' + jid.replace(/@.+/, '')) 

                        await this.sendMessage(id, {
                            text,
                            mentions: [jid],
                            contextInfo: { mentionedJid: [jid] }
                        }).catch(e => console.log('Gagal kirim welcome:', e))
                    }
                }
                break            
        }
    } catch (err) {
        console.error('Error participantsUpdate:', err)
    }
  },
  
  async delete({ remoteJid, fromMe, id, participant }) {
        // FIX: Dibungkus try catch agar tidak error undefined properties 
        try {
            if (fromMe) return
            // FIX: Ganti conn.chats menjadi this.chats
            if (!this.chats) return; 
            
            let chats = Object.entries(this.chats).find(([user, data]) => data.messages && data.messages[id])
            if (!chats) return
            let msg = JSON.parse(chats[1].messages[id])
            
            let chat = global.db.data.chats[msg.key.remoteJid] || {}
            if (chat.delete) return
            
            // FIX: Handle jika participant undefined
            let participantId = participant || msg.key.participant || msg.key.remoteJid;
            let tag = participantId ? `@${participantId.replace(/@.+/, '')}` : '@unknown';
            
            await this.sendMessage(msg.key.remoteJid, {
                text: `Terdeteksi ${tag} telah menghapus pesan\nUntuk mematikan fitur ini, ketik\n*.enable delete*`,
                mentions: participantId ? [participantId] : [],
                contextInfo: { mentionedJid: participantId ? [participantId] : [] }
            }, { quoted: msg }).catch(() => {})

            this.copyNForward(msg.key.remoteJid, msg).catch(e => console.log('Gagal copyNForward anti-delete:', e))
        } catch (err) {
            console.error('Error in anti-delete:', err)
        }
    }
}

// Global Dfail definition outside of module.exports
global.dfail = (type, m, conn) => {
    let msg = {
        rowner: 'Perintah ini hanya dapat digunakan oleh _*OWNER!1!1!*_',
        owner: 'Perintah ini hanya dapat digunakan oleh _*Owner Bot*_!',
        mods: 'Perintah ini hanya dapat digunakan oleh _*Owner dan Moderator*_ !',
        rpg: "Fitur RPG Dimatikan Oleh Admin\n\n> ketik *.enable rpg* agar dapat akses fitur rpg",
        nsfw: "Fitur NSFW Dimatikan Oleh Admin\n\n> ketik *.enable nsfw* agar dapat akses fitur NSFW",
        premium: 'Perintah ini hanya untuk member _*Premium*_ !',
        group: 'Perintah ini hanya dapat digunakan di grup! \n> Ketik .gcbot untuk bergabung ke grup official bot.',
        private: 'Perintah ini hanya dapat digunakan di Chat Pribadi!',
        admin: 'Perintah ini hanya untuk *Admin* grup!',
        botAdmin: 'Jadikan bot sebagai *Admin* untuk menggunakan perintah ini!',
        unreg: 'Silahkan daftar untuk menggunakan fitur ini dengan cara mengetik:\n\n*#daftar nama.umur*\n\nContoh: *#daftar Mitra.16*',
        restrict: 'Fitur ini di *disable*!',
        token: 'Token anda habis! Fitur ini memerlukan token khusus.'
    }[type] 
    if (msg) return m.reply(msg)
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    delete require.cache[file]
    if (global.reloadHandler) console.log(global.reloadHandler())
})