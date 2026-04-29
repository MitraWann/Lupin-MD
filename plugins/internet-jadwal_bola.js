const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Menu Bantuan dengan tambahan UCL
    if (!text) return m.reply(`📅 *JADWAL SEPAK BOLA*\n\nContoh: *${usedPrefix + command} ucl*\n\n*Liga yang tersedia:*\n- Inggris\n- Spanyol\n- Italia\n- Jerman\n- Perancis\n- Belanda\n- Portugal\n- Brasil\n- UCL (Champions)`)

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    let liga = text.toLowerCase().trim()
    let idLiga = ''
    let namaLiga = ''

    // 2. Pemetaan Kode Liga (UCL Ditambahkan)
    if (liga === 'inggris' || liga === 'epl') { idLiga = 'PL'; namaLiga = 'INGGRIS' }
    else if (liga === 'spanyol' || liga === 'laliga') { idLiga = 'PD'; namaLiga = 'SPANYOL' }
    else if (liga === 'italia' || liga === 'seriea') { idLiga = 'SA'; namaLiga = 'ITALIA' }
    else if (liga === 'jerman' || liga === 'bundesliga') { idLiga = 'BL1'; namaLiga = 'JERMAN' }
    else if (liga === 'prancis' || liga === 'perancis' || liga === 'ligue1') { idLiga = 'FL1'; namaLiga = 'PERANCIS' }
    else if (liga === 'belanda' || liga === 'eredivisie') { idLiga = 'DED'; namaLiga = 'BELANDA' }
    else if (liga === 'portugal') { idLiga = 'PPL'; namaLiga = 'PORTUGAL' }
    else if (liga === 'brasil' || liga === 'brazil') { idLiga = 'BSA'; namaLiga = 'BRASIL' }
    else if (liga === 'ucl' || liga === 'champions' || liga === 'champion') { idLiga = 'CL'; namaLiga = 'CHAMPIONS LEAGUE 🇪🇺' }
    else {
        return m.reply(`❌ *Liga tidak ditemukan!*\n\nSilakan pilih dari: *inggris, spanyol, italia, jerman, perancis, belanda, portugal, brasil, ucl*.`)
    }

    try {
        const API_KEY = '998a6e0d1fe24d81be4202dac53e6b3f' 

        let { data } = await axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/matches?status=SCHEDULED`, {
            headers: { 'X-Auth-Token': API_KEY }
        })

        let matches = data.matches

        if (!matches || matches.length === 0) {
            return m.reply(`ℹ️ *Jadwal Kosong!*\n\n> Saat ini tidak ada jadwal pertandingan terdekat untuk ${namaLiga}.`)
        }

        let teks = `📅 *JADWAL ${namaLiga}*\n────────────────────\n\n`
        
        // Ambil 10 pertandingan terdekat saja agar tidak spam
        let upcoming = matches.slice(0, 10)

        upcoming.forEach((match) => {
            let home = match.homeTeam.shortName || match.homeTeam.name || 'TBD'
            let away = match.awayTeam.shortName || match.awayTeam.name || 'TBD'
            // UCL biasanya menggunakan keterangan stage/group
            let matchday = match.group ? match.group.replace('_', ' ') : (match.matchday || match.stage.replace(/_/g, ' '))
            
            let dateObj = new Date(match.utcDate)
            
            let tanggal = dateObj.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short', 
                timeZone: 'Asia/Makassar' 
            })
            
            let jam = dateObj.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit', 
                timeZone: 'Asia/Makassar' 
            })
            
            teks += `⚽ *${home} vs ${away}*\n`
            teks += `> 🕒 ${tanggal} • ${jam.replace('.', ':')} WITA\n`
            teks += `> 🏟️ ${matchday}\n\n`
        })

        teks += `────────────────────\n`
        teks += `_Source : football-data.org_` 
        
        await m.reply(teks)
        
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e)
        if (e.response && e.response.status === 400) {
            return m.reply(`❌ *Akses Ditolak!*\n\n> API Key sudah tidak valid atau mencapai limit harian.`)
        }
        m.reply(`❌ *Gagal!*\n\n> Tidak dapat mengambil data jadwal. Pastikan nama liga benar atau server sedang sibuk.`)
    }
}

handler.help = ['jadwal <liga>']
handler.tags = ['internet']
handler.command = /^(jadwal|jadwalbola|fixtures)$/i

module.exports = handler