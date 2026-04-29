const axios = require('axios')
const ChatGpt = require('../lib/chatgpt.js')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('vs') || !text.includes('|')) {
        return m.reply(
            `⚽ *PREDIKSI SKOR AI*\n\n` +
            `Contoh: *${usedPrefix + command} spanyol | Barcelona vs Madrid*\n\n` +
            `*Liga yang tersedia:*\n` +
            `- Inggris, Spanyol, Italia, Jerman\n` +
            `- Perancis, Belanda, Portugal, Brasil, UCL`
        )
    }

    let [ligaInput, teams] = text.split('|').map(v => v.trim())
    let [timA, timB] = teams.split('vs').map(v => v.trim())

    if (!ligaInput || !timA || !timB) return m.reply("⚠️ Format salah! Contoh: `.prediksi spanyol | Barcelona vs Madrid`")

    let liga = ligaInput.toLowerCase()
    let idLiga = ''
    if (liga === 'inggris' || liga === 'epl') idLiga = 'PL'
    else if (liga === 'spanyol' || liga === 'laliga') idLiga = 'PD'
    else if (liga === 'italia' || liga === 'seriea') idLiga = 'SA'
    else if (liga === 'jerman' || liga === 'bundesliga') idLiga = 'BL1'
    else if (liga === 'prancis' || liga === 'perancis' || liga === 'ligue1') idLiga = 'FL1'
    else if (liga === 'belanda' || liga === 'eredivisie') idLiga = 'DED'
    else if (liga === 'portugal') idLiga = 'PPL'
    else if (liga === 'brasil' || liga === 'brazil') idLiga = 'BSA'
    else if (liga === 'ucl' || liga === 'champions') idLiga = 'CL'
    else {
        return m.reply(`❌ *Liga tidak ditemukan!*\nSilakan pilih dari: inggris, spanyol, italia, jerman, perancis, belanda, portugal, brasil, ucl.`)
    }

    await conn.sendMessage(m.chat, { react: { text: '🧠', key: m.key } })

    try {
        const API_KEY = '998a6e0d1fe24d81be4202dac53e6b3f'

        // TAHAP 1: Ambil Klasemen & Top Skor
        let [resStandings, resScorers] = await Promise.all([
            axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/standings`, { headers: { 'X-Auth-Token': API_KEY } }),
            axios.get(`https://api.football-data.org/v4/competitions/${idLiga}/scorers`, { headers: { 'X-Auth-Token': API_KEY } })
        ])

        let dataKlasemen = resStandings.data
        let dataScorers = resScorers.data.scorers || []

        if (!dataKlasemen.standings || dataKlasemen.standings.length === 0) throw new Error('Data klasemen tidak ditemukan.')

        let allTeams = []
        dataKlasemen.standings.forEach(group => {
            group.table.forEach(t => allTeams.push(t))
        })

        // Mesin Pencari Tim 
        const findTeam = (teamsList, inputName) => {
            let search = inputName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
            return teamsList.find(v => {
                let name = (v.team.name || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                let shortName = (v.team.shortName || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                let tla = (v.team.tla || '').toLowerCase()
                return name.includes(search) || shortName.includes(search) || tla.includes(search)
            })
        }

        let statsA = findTeam(allTeams, timA)
        let statsB = findTeam(allTeams, timB)

        if (!statsA || !statsB) {
            let missing = !statsA ? timA : timB
            return m.reply(`❌ Tim *${missing}* tidak ditemukan di klasemen ${ligaInput.toUpperCase()}.`)
        }

        // TAHAP 2: Ambil Detail Tim (Pelatih & Skuad Terbaru)
        let [resTeamA, resTeamB] = await Promise.all([
            axios.get(`https://api.football-data.org/v4/teams/${statsA.team.id}`, { headers: { 'X-Auth-Token': API_KEY } }),
            axios.get(`https://api.football-data.org/v4/teams/${statsB.team.id}`, { headers: { 'X-Auth-Token': API_KEY } })
        ])

        let detailA = resTeamA.data
        let detailB = resTeamB.data

        let nameA = statsA.team.shortName || statsA.team.name
        let nameB = statsB.team.shortName || statsB.team.name

        let coachA = detailA.coach ? detailA.coach.name : 'Data pelatih tidak tersedia'
        let coachB = detailB.coach ? detailB.coach.name : 'Data pelatih tidak tersedia'

        let formA = statsA.form ? statsA.form.split('').join('-') : 'Tidak tersedia'
        let formB = statsB.form ? statsB.form.split('').join('-') : 'Tidak tersedia'

        // Menyusun Skuad (Tanpa filter dari kita, AI yang akan memfilter)
        const formatSquad = (squad) => {
            if (!squad || squad.length === 0) return 'Tidak tersedia'
            let attackers = squad.filter(p => p.position === 'Offence').map(p => p.name).join(', ')
            let midfielders = squad.filter(p => p.position === 'Midfield').map(p => p.name).join(', ')
            let defenders = squad.filter(p => p.position === 'Defence').map(p => p.name).join(', ')
            return `Penyerang: ${attackers || '-'}\nGelandang: ${midfielders || '-'}\nBek: ${defenders || '-'}`
        }


        let getTopScorer = (teamId) => {
            let player = dataScorers.find(s => s.team.id === teamId)
            return player ? `${player.player.name} (${player.goals} Gol)` : 'Tidak ada di daftar top skor'
        }

        let topSkorA = getTopScorer(statsA.team.id)
        let topSkorB = getTopScorer(statsB.team.id)

        // ==========================================
        // PROMPT AI KUSTOM (TEKNIS & TERFOKUS)
        // ==========================================
        let promptPrediksi = `
INSTRUKSI SISTEM TEKNIS:
Bertindaklah sebagai Analis Sepak Bola Profesional murni. Kamu DILARANG menggunakan memori internalmu untuk menentukan siapa pelatih atau statistik liga tim tersebut; kamu HANYA boleh menggunakan data pelatih dan performa yang tertulis di bawah ini.

NAMUN, karena daftar skuad di bawah ini berisi seluruh pemain (termasuk cadangan dan akademi), kamu DIIZINKAN dan WAJIB menggunakan pengetahuan sepak bolamu untuk MENGIDENTIFIKASI DAN MENYARING mana saja pemain yang merupakan pemain reguler (First Team) dari daftar tersebut. Abaikan pemain lapis ketiga/muda yang tidak relevan.

PERTANDINGAN: ${nameA} vs ${nameB}

=== DATA TIM ${nameA} ===
- PELATIH SAAT INI: ${coachA}
- Stadion: ${detailA.venue || '-'}
- Peringkat: ${statsA.position}
- Gol : ${statsA.goalsFor} | Kebobolan: ${statsA.goalsAgainst}
- Form 5 Laga: ${formA}
- Top Skor: ${topSkorA}


=== DATA TIM ${nameB} ===
- PELATIH SAAT INI: ${coachB}
- Stadion: ${detailB.venue || '-'}
- Peringkat: ${statsB.position}
- Gol : ${statsB.goalsFor} | Kebobolan : ${statsB.goalsAgainst}
- Form 5 Laga: ${formB}
- Top Skor: ${topSkorB}


Tugas Analisis:
1. Analisis Adu taktik antara pelatih ${coachA} dan ${coachB}.
2. Analisis peringkat tim serta statistik gol yang dicetak dan jumlah kebobolan
3. Prediksi Skor Akhir yang teknis dan logis.
4. Probabilitas kemenangan dalam persentase (%).
Gaya bahasa: Objektif, teknis, umum, dan langsung pada poin analisis, tanpa pengantar bertele-tele dan tanpa format markdown berlebih.
`

        const ai = new ChatGpt({
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            lang: 'id-ID'
        })

        const response = await ai.startConversation(promptPrediksi, false, false)

        if (response && response.msg) {
            let cleanText = response.msg.replace(/\*/g, '').replace(/#/g, '').trim()
            
            let hasil = `🏟️ *ANALISIS PREDIKSI AI*\n`
            hasil += `╔══════════════════╗\n`
            hasil += `  ${nameA} vs ${nameB}\n`
            hasil += `╚══════════════════╝\n\n`
            hasil += cleanText
            
            await m.reply(hasil)
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
        }

    } catch (e) {
        console.error(e)
        if (e.response && e.response.status === 429) {
            return m.reply(`❌ *Fitur Colldown!*\n\n> Mohon tunggu 1 menit untuk mencoba lagi.`)
        }
        if (e.response && e.response.status === 400) {
            return m.reply(`❌ *Akses Ditolak!*\n\n> API Key sudah tidak valid.`)
        }
        m.reply(`❌ *Gagal melakukan analisis.*\n\nPastikan format benar atau coba beberapa saat lagi.`)
    }
}

handler.help = ['prediksi <liga> | <home> vs <away>']
handler.tags = ['internet']
handler.command = /^(prediksi|analyze|tebakskor)$/i

module.exports = handler