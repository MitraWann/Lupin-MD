/**
 * Plugin: Jadibot (Pairing Code System) - FIXED VERSION
 * Fitur: Mengizinkan user menjadi sub-bot dengan menghubungkan nomor via kode tautan.
 * Author: Senior WhatsApp Bot Developer
 */

const pino = require('pino')
const fs = require('fs')
const path = require('path')

// Inisialisasi array global untuk menampung koneksi jadibot
if (global.conns instanceof Array === false) global.conns = []

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // ==========================================
    // SOLUSI ERROR ESM: Menggunakan Dynamic Import
    // ==========================================
    const baileys = await import('@adiwajshing/baileys')
    const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, Browsers } = baileys
    
    // MENGGUNAKAN WRAPPER: Agar mewarisi fungsi helper dasar (getName, decodeJid, dll)
    const simple = require('../lib/simple')
    const makeWASocket = simple.makeWASocket || baileys.default || baileys.makeWASocket

    // ==========================================
    // COMMAND: .stopjadibot
    // ==========================================
    if (command === 'stopjadibot') {
        if (!global.conns || global.conns.length === 0) return m.reply('Tidak ada sesi jadibot yang aktif.')
        
        let botIndex = global.conns.findIndex(c => c.jadibotOwner === m.sender)
        if (botIndex === -1) return m.reply('Kamu tidak memiliki sesi jadibot yang aktif.')
        
        try {
            let sock = global.conns[botIndex]
            m.reply('⏳ Sedang memutuskan koneksi...')
            await sock.logout() // Logout dari WA
            global.conns.splice(botIndex, 1) // Hapus dari cache
            
            let authFolder = path.join(process.cwd(), 'jadibot', m.sender.split('@')[0])
            if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true })
            
            return m.reply('✅ Sesi jadibot kamu telah berhasil dihentikan secara permanen.')
        } catch (e) {
            return m.reply('❌ Gagal menghentikan sesi. Mungkin bot sudah terputus.')
        }
    }

    // ==========================================
    // COMMAND: .jadibot
    // ==========================================
    
    // Mencegah Jadibot membuat Jadibot (Infinite Loop/Sub-bot Inception)
    if (conn.user.jid !== global.conn.user.jid) {
        return m.reply('❌ Fitur ini hanya dapat dieksekusi di Bot Utama!')
    }

    // Keamanan: Hanya PC agar pairing code tidak dicuri
    if (m.isGroup) {
        return m.reply('⚠️ Demi keamanan akun Anda, fitur jadibot hanya bisa digunakan di *Private Chat (PC)* agar kode rahasia tidak bocor.')
    }

    // Pengecekan apakah user sudah login
    let existingBot = global.conns.find(c => c.jadibotOwner === m.sender)
    if (existingBot) {
        return m.reply(`❌ Kamu sudah memiliki sesi jadibot yang aktif!\n\nKetik *${usedPrefix}stopjadibot* jika ingin menghentikannya.`)
    }

    // Sanitasi Nomor HP untuk mencegah error request pairing code
    let phoneNumber = m.sender.split('@')[0].replace(/[^0-9]/g, '')
    let authFolder = path.join(process.cwd(), 'jadibot', phoneNumber)
    
    if (!fs.existsSync(authFolder)) {
        fs.mkdirSync(authFolder, { recursive: true })
    }

    // ==========================================
    // FUNGSI UTAMA KONEKSI (Dibuat rekursif untuk Auto-Reconnect)
    // ==========================================
    async function startJadibot() {
        const { state, saveCreds } = await useMultiFileAuthState(authFolder)
        
        const jbConfig = {
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }).child({ level: 'silent' }))
            },
            printQRInTerminal: false,
            logger: pino({ level: 'silent' }),
            browser: Browsers.ubuntu('Chrome'), // Format browser Baileys terbaru yang lebih stabil
            syncFullHistory: false,
            markOnlineOnConnect: false, // Memperingan beban saat pairing
            connectTimeoutMs: 60000, // Memperpanjang timeout untuk mencegah 408
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 10000,
            generateHighQualityLinkPreview: false
        }

        // Inisialisasi Instance Jadibot
        const sock = makeWASocket(jbConfig)
        
        // ==== FIX TYPEERROR ====
        // Menyalin fungsi helper tambahan (getName, decodeJid, sendFile, dll) dari bot utama
        // Hal ini mencegah crash saat handler.js & print.js mencoba mengeksekusi fungsi tersebut.
        if (global.conn) {
            for (let method in global.conn) {
                if (typeof global.conn[method] === 'function' && !sock[method]) {
                    sock[method] = global.conn[method].bind(sock)
                }
            }
        }
        
        // Menempelkan identitas sub-bot
        sock.isJadibot = true
        sock.jadibotOwner = m.sender

        // Request Pairing Code
        if (!sock.authState.creds.registered) {
            // Beri tahu user
            await conn.sendMessage(m.chat, { text: '⏳ Sistem sedang menyinkronkan data dengan server WhatsApp, mohon tunggu beberapa detik...' }, { quoted: m })
            
            // Beri jeda agak lama (5 detik) agar Web Socket Baileys benar-benar terbuka sebelum menembak request
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber)
                    code = code?.match(/.{1,4}/g)?.join('-') || code 
                    
                    let msg = `*🤖 TUTORIAL MENJADI BOT*\n\n1. Buka aplikasi WhatsApp.\n2. Klik ikon *Titik Tiga* (Opsi Lainnya) di pojok kanan atas.\n3. Pilih *Perangkat Taut*.\n4. Pilih *Tautkan dengan Nomor Telepon Saja*.\n5. Masukkan kode di bawah ini:\n\n*${code}*\n\n_⚠️ Kode ini rahasia dan akan expired, JANGAN bagikan ke orang lain!_`
                    await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
                } catch (e) {
                    console.error('[Jadibot Request Error]', e)
                    await conn.sendMessage(m.chat, { text: '❌ Gagal meminta Pairing Code (Mungkin jaringan sedang sibuk). Silakan ketik *.jadibot* ulang.' }, { quoted: m })
                    // Hapus folder karena gagal meminta kode agar tidak menjadi file sampah
                    if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true })
                }
            }, 5000)
        }

        // Listener Creds Update (Menyimpan sesi auth)
        sock.ev.on('creds.update', saveCreds)

        // Listener Koneksi
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update

            if (connection === 'open') {
                // Hapus sesi jadibot lama jika ada (mencegah duplikat array)
                global.conns = global.conns.filter(c => c.jadibotOwner !== m.sender)
                global.conns.push(sock)
                
                await conn.sendMessage(m.chat, { text: `✅ *Berhasil Tersambung!*\n\nNomor ini sekarang bertindak sebagai bot (Jadibot).\nSegala perintah akan direspon.\n\nKetik *${usedPrefix}stopjadibot* jika ingin mematikan koneksi.` }, { quoted: m })
            } 
            else if (connection === 'close') {
                let reason = lastDisconnect?.error?.output?.statusCode
                if (reason === DisconnectReason.loggedOut) {
                    await conn.sendMessage(m.chat, { text: '🔌 *Terputus!* Kamu telah keluar dari sesi Jadibot (Logged Out).' }, { quoted: m })
                    // Bersihkan Folder & Array Session
                    if (fs.existsSync(authFolder)) fs.rmSync(authFolder, { recursive: true, force: true })
                    global.conns = global.conns.filter(c => c.jadibotOwner !== m.sender)
                } else {
                    console.log(`[Jadibot] Reconnecting for ${phoneNumber}... Reason: ${reason}`)
                    // FIX: Panggil ulang fungsi startJadibot untuk mere-inisialisasi socket yang terputus (Error 515/408)
                    startJadibot()
                }
            }
        })

        // Routing Pesan Jadibot ke `handler.js`
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                if (!chatUpdate.messages || chatUpdate.messages.length === 0) return
                let handlerModule = require('../handler')
                // Memanggil global handler dengan bind Context/This dari `sock` Jadibot
                handlerModule.handler.call(sock, chatUpdate)
            } catch (e) {
                console.error('[Jadibot Error] Gagal meroute pesan:', e)
            }
        })
    }

    // Jalankan fungsi
    startJadibot()
}

handler.help = ['jadibot', 'stopjadibot']
handler.tags = ['main']
handler.command = /^(jadibot|stopjadibot)$/i

// Keamanan Tambahan
handler.private = true 
handler.premium = false 

module.exports = handler