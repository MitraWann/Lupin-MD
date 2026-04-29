let handler = async (m, { conn, usedPrefix }) => {
    let id = m.chat
    conn.absen = conn.absen ? conn.absen : {}
    if (!(id in conn.absen)) throw `_*Mohon maaf, Tidak ada absen hari ini !*_\n\n*${usedPrefix}mulaiabsen* - untuk memulai absen`

    let absen = conn.absen[id][1]
    // Pengecekan support format string lama atau object baru
    const wasVote = absen.some(v => (typeof v === 'string' ? v : v.jid) === m.sender)
    if (wasVote) throw '*Kamu sudah absen bang！🙄*'
    
    // Generate waktu (Timestamp)
    let time = new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' }) + ' WITA'
    
    // Menyimpan data Jid dan Waktu ke dalam array absen
    absen.push({ jid: m.sender, time: time })
    m.reply(`Done!`)
    
    let d = new Date
    let date = d.toLocaleDateString('id', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    
    // Melakukan map dengan format timestamp jika ada
    let list = absen.map((v, i) => {
        let jid = typeof v === 'string' ? v : v.jid
        let tm = typeof v === 'string' ? '' : ` _(${v.time})_`
        return `├ ${i + 1}. @${jid.split`@`[0]}${tm}`
    }).join('\n')
    
    let caption = `
Tanggal: ${date}
${conn.absen[id][2]}
┌「 *Absen* 」  
├ Total: ${absen.length}
${list} 
└────
_Silahkan Ketik ${usedPrefix}absen Untuk Absen_
_Ketik ${usedPrefix}cekabsen Untuk Cek Absen_`.trim()

    // Ambil semua JID saja untuk fitur tag (mentionedJid)
    let mentionedJids = absen.map(v => typeof v === 'string' ? v : v.jid)
    await conn.reply(m.chat, caption, m, { contextInfo: { mentionedJid: mentionedJids } })
}
handler.help = ['absen']
handler.tags = ['group']
handler.command = /^(absen|hadir)$/i
handler.group = true

module.exports = handler;