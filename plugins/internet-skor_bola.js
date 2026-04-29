const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Menu Bantuan disamakan dengan plugin bola lainnya
    if (!text) return m.reply(`📋 *HASIL PERTANDINGAN*\n\nContoh: *${usedPrefix + command} inggris*\n\n*Liga yang tersedia:*\n- Inggris\n- Spanyol\n- Italia\n- Jerman\n- Perancis\n- Belanda\n- Portugal\n- Brasil\n- UCL (Champions)`)

    // Reaksi peluit/kertas saat memproses
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

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

        // Menarik data pertandingan dengan status FINISHED (Sudah Selesai)
        let { data } = await axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/matches?status=FINISHED`, {
            headers: { 'X-Auth-Token': API_KEY }
        })

        let matches = data.matches

        if (!matches || matches.length === 0) {
            return m.reply(`ℹ️ *Hasil Kosong!*\n\n> Belum ada pertandingan yang selesai untuk liga ${namaLiga} saat ini.`)
        }

        // Header UX Minimalis
        let teks = `📋 *HASIL ${namaLiga}*\n────────────────────\n\n`
        
        // Ambil 10 pertandingan terakhir yang sudah selesai, lalu balik urutannya (terbaru di atas)
        let recentMatches = matches.slice(-10).reverse()

        recentMatches.forEach((match) => {
            let home = match.homeTeam.shortName || match.homeTeam.name || 'TBD'
            let away = match.awayTeam.shortName || match.awayTeam.name || 'TBD'
            
            // Mengambil Skor Akhir (Full Time)
            let scoreHome = match.score.fullTime.home ?? 0
            let scoreAway = match.score.fullTime.away ?? 0
            
            // Fitur Smart-Bold: Menebalkan tim yang menang
            let displayHome = scoreHome > scoreAway ? `*${home}*` : home
            let displayAway = scoreAway > scoreHome ? `*${away}*` : away
            
            // Penyesuaian Matchday untuk UCL vs Liga Domestik
            let matchday = match.group ? match.group.replace('_', ' ') : (match.matchday || match.stage?.replace(/_/g, ' ') || '-')
            
            // Format Tanggal disesuaikan dengan zona waktu lokal (WITA)
            let dateObj = new Date(match.utcDate)
            let tanggal = dateObj.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                timeZone: 'Asia/Makassar' 
            })
            
            // Susunan minimalis yang rapi
            teks += `⚽ ${displayHome}  *${scoreHome} - ${scoreAway}* ${displayAway}\n`
            teks += `> 📅 ${tanggal}\n`
            teks += `> 🏟️ Matchday: ${matchday}\n\n`
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
        m.reply(`❌ *Gagal!*\n\n> Tidak dapat mengambil data hasil pertandingan. Pastikan nama liga benar atau server sedang sibuk.`)
    }
}

handler.help = ['hasil <liga>']
handler.tags = ['internet']
handler.command = /^(hasil|skor|hasilbola|results)$/i

module.exports = handler