const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Menu Bantuan disamakan dengan plugin bola lainnya
    if (!text) return m.reply(`🎯 *TOP SKOR SEPAK BOLA*\n\nContoh: *${usedPrefix + command} inggris*\n\n*Liga yang tersedia:*\n- Inggris\n- Spanyol\n- Italia\n- Jerman\n- Perancis\n- Belanda\n- Portugal\n- Brasil\n- UCL (Champions)`)

    // Reaksi target/bola saat memproses
    await conn.sendMessage(m.chat, { react: { text: '🎯', key: m.key } })

    let liga = text.toLowerCase().trim()
    let idLiga = ''
    let namaLiga = ''

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

        // Menarik data Top Skor (Scorers) dari API
        let { data } = await axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/scorers`, {
            headers: { 'X-Auth-Token': API_KEY }
        })

        let scorers = data.scorers

        if (!scorers || scorers.length === 0) {
            return m.reply(`ℹ️ *Data Kosong!*\n\n> Belum ada data pencetak gol untuk liga ${namaLiga} saat ini.`)
        }

        // Header UX Minimalis
        let teks = `🎯 *TOP SKOR ${namaLiga}*\n────────────────────\n\n`
        
        // Ambil 10 pemain teratas agar tidak spam
        let top10 = scorers.slice(0, 10)

        top10.forEach((s, index) => {
            let rank = index + 1
            let icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `🏅`
            
            let playerName = s.player.name || 'Unknown'
            let teamName = s.team.shortName || s.team.name || 'Unknown'
            let goals = s.goals || 0
            let assists = s.assists || 0
            let pen = s.penalties || 0
            
            // Format Info Assist dan Penalti (jika ada)
            let extraInfo = []
            if (assists > 0) extraInfo.push(`${assists} Assist`)
            if (pen > 0) extraInfo.push(`${pen} Penalti`)
            let detail = extraInfo.length > 0 ? ` (${extraInfo.join(', ')})` : ''

            // Susunan minimalis yang rapi
            teks += `${icon} *${rank}. ${playerName}*\n`
            teks += `> *${goals} GOL* • ${teamName}${detail}\n\n`
        })

        // Footer Legend & Source
        teks += `────────────────────\n`
        teks += `_Source : football-data.org_` 
        
        await m.reply(teks)
        
        // Reaksi centang hijau saat berhasil
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e)
        if (e.response && e.response.status === 400) {
            return m.reply(`❌ *Akses Ditolak!*\n\n> API Key sudah tidak valid atau mencapai limit harian.`)
        }
        m.reply(`❌ *Gagal!*\n\n> Tidak dapat mengambil data top skor. Pastikan nama liga benar atau server sedang sibuk.`)
    }
}

handler.help = ['topskor <liga>']
handler.tags = ['internet']
handler.command = /^(topskor|topscorer|pencetakgol)$/i

module.exports = handler