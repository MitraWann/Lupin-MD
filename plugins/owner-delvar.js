/**
 * Plugin  : Database Variable Scanner (Orphan Variable Detector)
 * Author  : Senior WA Bot Developer
 * Fungsi  : Membaca handler.js dan seluruh file plugin, lalu mencari 
 * inisialisasi variabel database yang sudah tidak pernah terpakai di fitur manapun.
 */

const fs = require('fs')
const path = require('path')

let handler = async (m, { conn, usedPrefix, command, args }) => {
    let isClean = args.includes('--clean') || args.includes('--delete')
    let isFind = args.includes('--find') || args[0] === 'find'
    
    // ==========================================
    // FITUR PENCARIAN LOKASI VARIABEL
    // ==========================================
    if (isFind) {
        let targetIndex = args.indexOf('--find') > -1 ? args.indexOf('--find') : args.indexOf('find')
        let targetVarName = args[targetIndex + 1]
        
        if (!targetVarName) return m.reply(`❌ Masukkan nama variabel yang ingin dicari!\nContoh: *${usedPrefix + command} find kayu*`)
        
        await m.reply(`🔍 *Mencari penggunaan variabel \`${targetVarName}\`...*\n_Memindai seluruh file di folder \`plugins/\`._`)
        
        try {
            let pluginsDir = path.join(process.cwd(), 'plugins')
            let pluginFiles = fs.readdirSync(pluginsDir).filter(v => v.endsWith('.js'))
            let foundInFiles = []
            
            // Regex untuk mencari kata yang sama persis (boundary)
            let regex = new RegExp('\\b' + targetVarName + '\\b')
            
            for (let file of pluginFiles) {
                let code = fs.readFileSync(path.join(pluginsDir, file), 'utf-8')
                if (regex.test(code)) {
                    foundInFiles.push(file)
                }
            }
            
            if (foundInFiles.length > 0) {
                let txt = `*🎯 HASIL PENCARIAN VARIABEL*\n\n`
                txt += `Variabel \`${targetVarName}\` terdeteksi dipanggil/digunakan pada *${foundInFiles.length} file* berikut:\n`
                txt += foundInFiles.map(v => ` ⫹⫺ ${v}`).join('\n')
                return m.reply(txt)
            } else {
                return m.reply(`❌ Variabel \`${targetVarName}\` *TIDAK DITEMUKAN* di file plugin manapun.\n\n_Variabel ini kemungkinan usang (orphan) dan aman untuk dihapus._`)
            }
        } catch (e) {
            console.error(e)
            return m.reply(`❌ Terjadi kesalahan saat mencari: ${e.message}`)
        }
    }

    await m.reply(`🔍 *Memulai pemindaian...*\n_Mengekstrak inisialisasi di \`handler.js\` dan mencocokkannya dengan folder \`plugins/\`. Proses ini mungkin memakan waktu beberapa detik._`)

    try {
        // 1. Baca file handler.js di root directory
        let handlerPath = path.join(process.cwd(), 'handler.js')
        if (!fs.existsSync(handlerPath)) return m.reply('❌ File `handler.js` tidak ditemukan di direktori utama!')
        
        let handlerCode = fs.readFileSync(handlerPath, 'utf-8')
        
        // Tempat penyimpanan sementara untuk nama-nama variabel
        let userVars = new Set()
        let chatVars = new Set()

        // 2. REGEX: Ekstrak semua properti inisialisasi user & chat dari handler.js
        // Mencari pola seperti: if (!isNumber(user.kayu)) atau if (!('kayu' in user)) atau if (!user.kayu)
        let userRegex = [
            /if\s*\(\!isNumber\(\s*user\.([a-zA-Z0-9_]+)\s*\)\)/g,
            /if\s*\(\!\(\s*['"]([a-zA-Z0-9_]+)['"]\s*in\s*user\s*\)\)/g,
            /if\s*\(\!\s*['"]([a-zA-Z0-9_]+)['"]\s*in\s*user\s*\)/g,
            /if\s*\(\!user\.([a-zA-Z0-9_]+)\)/g
        ]
        
        let chatRegex = [
            /if\s*\(\!isNumber\(\s*chat\.([a-zA-Z0-9_]+)\s*\)\)/g,
            /if\s*\(\!\(\s*['"]([a-zA-Z0-9_]+)['"]\s*in\s*chat\s*\)\)/g,
            /if\s*\(\!\s*['"]([a-zA-Z0-9_]+)['"]\s*in\s*chat\s*\)/g,
            /if\s*\(\!chat\.([a-zA-Z0-9_]+)\)/g
        ]

        let match;
        // Kumpulkan target User
        userRegex.forEach(rx => {
            while ((match = rx.exec(handlerCode)) !== null) userVars.add(match[1])
        })
        // Kumpulkan target Chat
        chatRegex.forEach(rx => {
            while ((match = rx.exec(handlerCode)) !== null) chatVars.add(match[1])
        })

        // 3. Baca seluruh file JS di dalam folder plugins
        let pluginsDir = path.join(process.cwd(), 'plugins')
        let pluginFiles = fs.readdirSync(pluginsDir).filter(v => v.endsWith('.js'))
        
        // Gabungkan seluruh teks plugin untuk mempercepat proses scanning matching
        let allPluginsCode = ''
        for (let file of pluginFiles) {
            allPluginsCode += fs.readFileSync(path.join(pluginsDir, file), 'utf-8') + '\n'
        }

        // 4. Proses Eliminasi (Mencari yang Orphan/Usang)
        let orphanUserVars = []
        let orphanChatVars = []

        // Variabel Core bawaan bot yang wajib ada meskipun tidak dipanggil langsung di plugin
        let coreVars = ['name', 'registered', 'regTime', 'age', 'banned', 'limit', 'exp', 'premium', 'role', 'isBanned', 'welcome', 'detect', 'antiLink', 'delete', 'sWelcome', 'sBye']

        for (let v of userVars) {
            if (coreVars.includes(v)) continue // Skip core variables
            
            // Cek apakah string variabel ini pernah diketik di file plugin
            let regex = new RegExp('\\b' + v + '\\b')
            if (!regex.test(allPluginsCode)) {
                orphanUserVars.push(v)
            }
        }

        for (let v of chatVars) {
            if (coreVars.includes(v)) continue // Skip core variables

            let regex = new RegExp('\\b' + v + '\\b')
            if (!regex.test(allPluginsCode)) {
                orphanChatVars.push(v)
            }
        }

        // 5. Build UI/UX Output Pesan
        let txt = `*🕵️ HASIL SCAN DATABASE ORPHAN*\n\n`
        txt += `Variabel di bawah ini diinisialisasi secara aktif di \`handler.js\` tetapi terdeteksi *TIDAK PERNAH TERPAKAI* di semua file \`plugins/*.js\` Anda.\n\n`
        
        txt += `*👤 USERS DB (${orphanUserVars.length} indikasi):*\n`
        if (orphanUserVars.length > 0) {
            txt += orphanUserVars.map(v => ` ⫹⫺ ${v}`).join('\n')
        } else {
            txt += ` ✅ Bersih, semua variabel terpakai.`
        }

        txt += `\n\n*💬 CHATS DB (${orphanChatVars.length} indikasi):*\n`
        if (orphanChatVars.length > 0) {
            txt += orphanChatVars.map(v => ` ⫹⫺ ${v}`).join('\n')
        } else {
            txt += ` ✅ Bersih, semua variabel terpakai.`
        }

        if (isClean && (orphanUserVars.length > 0 || orphanChatVars.length > 0)) {
            let handlerLines = handlerCode.split('\n')
            let newLines = []
            let deletedCount = 0

            // Hapus baris yang mengandung inisialisasi variabel yatim/orphan
            for (let line of handlerLines) {
                let shouldDelete = false

                for (let v of orphanUserVars) {
                    // Match "if (!isNumber(user.kayu))" atau "if (!('kayu' in user))"
                    let rxIf = new RegExp(`^\\s*if\\s*\\(.*(?:user\\.${v}|['"]${v}['"]\\s*in\\s*user).*\\)`, 'i')
                    // Match "kayu: 0," di dalam object
                    let rxObj = new RegExp(`^\\s*${v}\\s*:.*,?\\s*$`, 'i')
                    
                    if (rxIf.test(line) || rxObj.test(line)) { shouldDelete = true; break; }
                }

                if (!shouldDelete) {
                    for (let v of orphanChatVars) {
                        let rxIf = new RegExp(`^\\s*if\\s*\\(.*(?:chat\\.${v}|['"]${v}['"]\\s*in\\s*chat).*\\)`, 'i')
                        let rxObj = new RegExp(`^\\s*${v}\\s*:.*,?\\s*$`, 'i')
                        
                        if (rxIf.test(line) || rxObj.test(line)) { shouldDelete = true; break; }
                    }
                }

                if (shouldDelete) deletedCount++
                else newLines.push(line)
            }

            fs.writeFileSync(handlerPath, newLines.join('\n'))
            txt += `\n\n*🧹 PROSES PEMBERSIHAN OTOMATIS BERHASIL!*\n`
            txt += `Menghapus *${deletedCount}* baris inisialisasi dari file \`handler.js\`.\n`
            txt += `\n*Catatan:* File \`handler.js\` sudah diperbarui. Bot akan otomatis me-reload file ini (jika fitur auto-reload menyala) atau silakan restart bot agar bersih sepenuhnya.\n`
            txt += `Jangan lupa ketik *${usedPrefix}delvar <namavariabel>* untuk membersihkan sisa datanya di memori!`
        } else {
            txt += `\n\n*⚙️ WORKFLOW PEMBERSIHAN:*\n`
            txt += `1. Ketik *${usedPrefix + command} --clean* untuk MENGHAPUS OTOMATIS semua inisialisasi usang di atas dari \`handler.js\`.\n`
            txt += `2. Ketik *${usedPrefix + command} find <namavariabel>* untuk mengecek dimana saja sebuah variabel digunakan.\n`
            txt += `3. Setelah pembersihan sukses, ketik *${usedPrefix}delvar <namavariabel>* untuk membersihkan sisa datanya di memory pengguna yang ada.`
        }

        m.reply(txt)

    } catch (e) {
        console.error(e)
        m.reply(`❌ Terjadi kesalahan saat melakukan pemindaian: ${e.message}`)
    }
}

// Metadata Plugin
handler.help = ['scanvar', 'scanvar --clean', 'scanvar find <var>']
handler.tags = ['owner']
handler.command = /^(scanvar|scandb|cekdb)$/i

// Flag Keamanan
handler.owner = true

module.exports = handler