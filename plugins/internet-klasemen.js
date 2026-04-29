const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Menu Bantuan dengan tambahan UCL
    if (!text) return m.reply(`📊 *KLASEMEN SEPAK BOLA*\n\nContoh: *${usedPrefix + command} inggris*\n\n*Liga yang tersedia:*\n- Inggris\n- Spanyol\n- Italia\n- Jerman\n- Perancis\n- Belanda\n- Portugal\n- Brasil\n- UCL (Champions)`)

    await conn.sendMessage(m.chat, { react: { text: '⚽', key: m.key } })

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

        let { data } = await axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/standings`, {
            headers: { 'X-Auth-Token': API_KEY }
        })

        if (!data.standings || data.standings.length === 0) throw new Error('Data tidak ditemukan.')

        // Mengecek apakah UCL masih menggunakan format grup (A-H) atau format League Phase baru
        let isUCLGroup = idLiga === 'CL' && data.standings.length > 1
        
        let teks = `🏆 *KLASEMEN ${namaLiga}*\n────────────────────\n\n`
        
        if (isUCLGroup) {
            // Handle Format Grup (Klasik)
            data.standings.forEach(group => {
                teks += `*${group.group.replace('_', ' ')}*\n`
                group.table.forEach(team => {
                    let rank = team.position
                    // 1-2 UCL, 3 UEL, 4 Gugur
                    let icon = rank <= 2 ? '🔵' : rank === 3 ? '🟠' : '🔴'
                    let teamName = team.team.shortName || team.team.name
                    teks += `${icon} *${rank}. ${teamName}*\n`
                    teks += `> *${team.points} PTS* • 🄻:${team.playedGames} (🅼${team.won}-🆂${team.draw}-🅺${team.lost})\n\n`
                })
            })
        } else {
            // Handle Format Liga / League Phase
            let tableData = data.standings[0].table || data.standings
            let limit = idLiga === 'CL' ? 36 : 20 // UCL baru memiliki 36 tim

            tableData.slice(0, limit).forEach((team) => {
                let rank = team.position
                let teamName = team.team.shortName || team.team.name
                
                // Logika Zona Klasemen Otomatis
                let icon = '⚪' // Default Papan Tengah
                
                if (idLiga === 'CL') { // Aturan League Phase UCL
                    icon = rank <= 8 ? '🔵' : rank <= 24 ? '🟠' : '🔴'
                } else if (['PL', 'PD', 'SA'].includes(idLiga)) { // Liga Top Eropa (20 Tim)
                    icon = rank <= 4 ? '🔵' : rank === 5 ? '🟠' : rank === 6 ? '🟢' : rank >= 18 ? '🔴' : '⚪'
                } else if (idLiga === 'BL1' || idLiga === 'FL1') { // Jerman & Perancis (18 Tim)
                    icon = rank <= 4 ? '🔵' : rank === 5 ? '🟠' : rank === 6 ? '🟢' : rank >= 16 ? '🔴' : '⚪'
                } else if (idLiga === 'DED') { // Belanda (18 Tim)
                    icon = rank <= 3 ? '🔵' : rank === 4 ? '🟠' : rank >= 5 && rank <= 8 ? '🟢' : rank >= 16 ? '🔴' : '⚪'
                } else if (idLiga === 'PPL') { // Portugal (18 Tim)
                    icon = rank <= 2 ? '🔵' : rank === 3 ? '🟠' : rank === 4 ? '🟢' : rank >= 16 ? '🔴' : '⚪'
                } else if (idLiga === 'BSA') { // Brasil
                    icon = rank <= 6 ? '🔵' : rank >= 7 && rank <= 12 ? '🟠' : rank >= 17 ? '🔴' : '⚪'
                }
                
                teks += `${icon} *${rank}. ${teamName}*\n`
                teks += `> *${team.points} PTS* • 🄻:${team.playedGames} (🅼${team.won}-🆂${team.draw}-🅺${team.lost})\n\n`
            })
        }

        // Footer Legend & Notasi
        teks += `────────────────────\n`
        if (idLiga === 'CL') {
            teks += `🔵 Lolos 16 Besar\n🟠 Play-off Knockout\n🔴 Gugur\n\n`
        } else if (idLiga === 'BSA') {
            teks += `🔵 Copa Libertadores\n🟠 Copa Sudamericana\n🔴 Degradasi\n\n`
        } else {
            teks += `🔵 Liga Champions UEFA\n🟠 Liga Eropa\n🟢 Kualifikasi Liga Konferensi\n🔴 Degradasi\n⚪ Papan Tengah\n\n`
        }
        teks += `🄻 : Laga | 🅼 : Menang | 🆂 : Seri | 🅺 : Kalah\n\n`
        teks += `_Source : football-data.org_` 
        
        await m.reply(teks)
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error(e)
        if (e.response && e.response.status === 400) {
            return m.reply(`❌ *Akses Ditolak!*\n\n> API Key sudah tidak valid atau mencapai limit harian.`)
        }
        m.reply(`❌ *Gagal!*\n\n> Tidak dapat mengambil data klasemen. Pastikan server sedang tidak sibuk.`)
    }
}

handler.help = ['klasemen <liga>']
handler.tags = ['internet']
handler.command = /^(klasemen|liga|standings)$/i

module.exports = handler