const ChatGpt = require('../lib/chatgpt.js')
const fs = require('fs')
const path = require('path')

// Objek untuk menyimpan memori percakapan & status Auto AI
global.mitra_session = global.mitra_session || {}
global.mitra_auto_ai = global.mitra_auto_ai || {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Tentukan input teks (dari perintah atau dari chat biasa jika itu auto/reply)
    let input = text ? text.trim() : m.text.trim()

    // ==========================================
    // SAKLAR & KONTROL (ON/OFF/RESET)
    // ==========================================
    let cmd = input.toLowerCase()
    
    if (cmd === 'on' || cmd === 'enable') {
        global.mitra_auto_ai[m.sender] = true
        return m.reply("✅ *AI Mitra AKTIF!*\n\nSekarang Wann akan otomatis membalas *hanya jika kamu me-reply* pesannya.")
    }
    
    if (cmd === 'off' || cmd === 'disable') {
        delete global.mitra_auto_ai[m.sender]
        return m.reply("❌ *Auto AI Mitra MATI!*\n\nWann tidak akan merespons otomatis (walaupun di-reply), kecuali kamu memanggilnya dengan perintah `.mitra <pertanyaan>`.")
    }

    if (cmd === 'reset') {
        global.mitra_session[m.sender] = []
        return m.reply("✅ Sesi memori percakapan telah direset, Boss!")
    }

    if (!input) {
        return m.reply(
            `💬 *Halo Boss! Ada yang bisa Wann bantu?*\n\n` +
            `*Kontrol AI:*\n` +
            `> \`${usedPrefix + command} on\` : Nyalakan respons otomatis (via Reply)\n` +
            `> \`${usedPrefix + command} off\` : Matikan respons otomatis\n` +
            `> \`${usedPrefix + command} reset\` : Hapus ingatan chat`
        )
    }

    await conn.sendMessage(m.chat, { react: { text: '🤔', key: m.key } })

    try {
        // ==========================================
        // 1. MENGAMBIL DATABASE USER (Jadwal & Profil)
        // ==========================================
        let userDb = global.db.data.users[m.sender] || {};
        
        // A. Data Waktu (WITA)
        let nowMs = Date.now();
        let tzOpt = { timeZone: "Asia/Makassar", dateStyle: "full", timeStyle: "short" };
        let waktuSekarang = new Date(nowMs).toLocaleString("id-ID", tzOpt);

        // B. Data Pengingat/Jadwal Aktif
        let pengingat = userDb.pengingat || [];
        let teksPengingat = "Saat ini User TIDAK memiliki jadwal pengingat.";

        if (pengingat.length > 0) {
            teksPengingat = "Berikut adalah daftar jadwal User saat ini:\n";
            pengingat.forEach((p, i) => {
                let dateStr = new Date(p.waktu).toLocaleString("id-ID", tzOpt);
                let status = p.status === 0 ? 'Aktif' : 'Sudah lewat';
                teksPengingat += `${i + 1}. Pesan: "${p.pesan}" | Waktu: ${dateStr} WITA | Status: ${status}\n`;
            });
        }

        // C. Data Profil (Nama & Umur)
        let infoProfil = "";
        if (userDb.registered) {
            infoProfil = `Nama Panggilan: ${userDb.name}\nUmur: ${userDb.age} tahun.`;
        } else {
            infoProfil = `User ini belum mendaftar di database bot. Kamu belum mengetahui nama dan umurnya. Arahkan user untuk daftar menggunakan perintah .daftar nama.umur atau .reg nama.umur`;
        }

        // ==========================================
        // 2. MEMBACA FILE PERSONA.TXT
        // ==========================================
        let filePersona = path.join(__dirname, '../persona.txt');
        let systemPrompt = "";

        try {
            let teksMentah = fs.readFileSync(filePersona, 'utf-8');
            systemPrompt = teksMentah
                .split('{WAKTU_SEKARANG}').join(waktuSekarang)
                .split('{TEKS_PENGINGAT}').join(teksPengingat);
            
            systemPrompt += `\n\n[INFORMASI PROFIL USER YANG SEDANG CHAT DENGANMU]:\n${infoProfil}`;
            if (m.isGroup) {
                systemPrompt += `\n\n[INFO LOKASI CHAT]: Saat ini kamu sedang mengobrol santai di dalam sebuah Grup WhatsApp.`;
            }
        } catch (err) {
            systemPrompt = `Kamu adalah Wann. Waktu saat ini: ${waktuSekarang} WITA. ${teksPengingat}\n\n[INFO PROFIL USER]:\n${infoProfil}`;
        }

        // ==========================================
        // 3. LOGIKA MEMORI/SESI
        // ==========================================
        if (!global.mitra_session[m.sender]) global.mitra_session[m.sender] = []
        let sejarah = global.mitra_session[m.sender]

        // Gabungkan System Prompt + Riwayat + Pertanyaan Baru
        let fullPrompt = `System: ${systemPrompt}\n\n`
        
        let riwayatTeks = sejarah.map(chat => `${chat.role}: ${chat.content}`).join('\n')
        let promptFinal = `${fullPrompt}${riwayatTeks}\nUser: ${input}\nAssistant:`

        // ==========================================
        // 4. MENGIRIM KE API (ChatGpt Class)
        // ==========================================
        const ai = new ChatGpt({
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            lang: 'id-ID'
        })

        const response = await ai.startConversation(promptFinal, false, false)

        if (response && response.msg) {
            let cleanText = response.msg.trim()
                .replace(/\*/g, '') 
                .replace(/#/g, '')
                .trim()

            await m.reply(cleanText)

            // Simpan ke Memori Sesi
            sejarah.push({ role: 'User', content: input })
            sejarah.push({ role: 'Assistant', content: cleanText })

            // Batasi ingatan 10 riwayat terakhir
            if (sejarah.length > 10) sejarah.shift() 

            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        } else {
            throw new Error('ChatGPT memberikan respon kosong.')
        }

    } catch (e) {
        console.error('Error ChatGPT:', e)
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`⚠️ Maaf Boss, AI sedang gangguan.`)
    }
}

handler.help = ['mitra on/off', 'mitra reset']
handler.tags = ['ai']
handler.command = /^(mitra|wann)$/i
handler.owner = true

// ==========================================
// PENDETEKSI OTOMATIS (HANYA MERESPON REPLY)
// ==========================================
handler.before = async (m, { conn }) => {
    // Abaikan jika pesan diawali prefix (perintah bot biasa) atau bukan teks
    if (!m.text || /^[./!#]/.test(m.text)) return
    
    // Abaikan pesan dari bot itu sendiri
    if (m.isBaileys || m.fromMe) return

    global.mitra_auto_ai = global.mitra_auto_ai || {}
    
    // Cek status Auto AI user
    let isAutoOn = global.mitra_auto_ai[m.sender]
    
    // ATURAN 2: JIKA MITRA OFF, ABAIKAN TOTAL (Bahkan jika di-reply)
    if (!isAutoOn) return

    // ATURAN 1: JIKA MITRA ON, PASTIKAN ITU ADALAH REPLY KE PESAN BOT
    let isReplyBot = m.quoted && m.quoted.fromMe && m.quoted.text

    // Jika pesan tersebut BUKAN reply ke pesan bot, hiraukan (jangan berisik)
    if (!isReplyBot) return

    // Jika lolos (Status ON & Merupakan Reply Bot), kirim ke otak Wann
    return handler(m, { conn, text: m.text, usedPrefix: '.', command: 'mitra' })
}

module.exports = handler