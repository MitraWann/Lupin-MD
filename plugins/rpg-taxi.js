/**
 * Plugin: RPG Taxi
 * Description: Simulasi taksi online dengan modern UX & receipt UI
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    // Kalkulasi Timer Cooldown (1 Jam / 3.600.000 ms)
    let __timers = (new Date - user.lasttaxi)
    let _timers = (3600000 - __timers)
    let timers = clockString(_timers)
    
    // FIX: Menggunakan username dari database atau pushName WA
    let name = user.name || m.pushName || 'Driver'
    let order = user.taxi || 0
    let id = m.sender
    let kerja = 'taxi'

    // Sistem pengunci misi agar tidak tumpang tindih
    conn.misi = conn.misi ? conn.misi : {}
    if (id in conn.misi) {
        return conn.reply(m.chat, `⚠️ Selesaikan orderan *${conn.misi[id][0]}* kamu terlebih dahulu!`, m)
    }

    if (new Date - user.lasttaxi > 3600000) {
        // Kunci status pemain sedang dalam misi
        conn.misi[id] = [kerja, 'proses']
        user.lasttaxi = new Date * 1

        // Kalkulasi Reward (Pendapatan dasar minimum Rp 25.000)
        let randomaku1 = Math.floor(Math.random() * 250000) // Acak hingga 250k
        let randomaku2 = Math.floor(Math.random() * 8000)   // Acak hingga 8k exp
        
        let uang = 25000 + randomaku1
        let exp = 1500 + randomaku2

        // Animasi UI Modern (Mengganti multiple-spam menjadi edit frame)
        let arr = [
            `🚕 *TAXI-ONLINE: MENCARI PENUMPANG*\n\n> 🔎 _Mencari penumpang di sekitar..._`,
            `🚕 *TAXI-ONLINE: MENDAPATKAN ORDERAN*\n\n🚶⬛⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️       🚕\n\n> 📍 _Menuju titik jemput penumpang..._`,
            `🚕 *TAXI-ONLINE: PERJALANAN DIMULAI*\n\n🚶⬛⬛⬛⬛🚐⬛⬛🚓🚚\n🚖⬜⬜⬛⬜⬜⬜🚓⬛🚑\n⬛⬛⬛⬛⬛⬛⬛⬛⬛🚙\n🏘️🏘️🏢️🌳  🌳 🏘️  🏘️🏡\n\n> 💨 _Mengantar penumpang ke tujuan..._`,
            `🚕 *TAXI-ONLINE: TIBA DI TUJUAN*\n\n⬛⬛⬛⬛⬛⬛⬛⬛⬛🚓\n⬛⬜🚗⬛⬜🚐⬛🚙🚚🚑\n⬛⬛⬛⬛🚒⬛⬛⬛⬛🚚\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️\n\n> ✅ _Penumpang turun, memproses argo pembayaran..._`
        ]

        let { key } = await conn.sendMessage(m.chat, {text: '🔍 *Aplikasi Taxi* | _Menyalakan argometer....._'}, { quoted: m })

        // Looping Animasi Edit Message (Durasi 2.5 detik per frame)
        try {
            for (let i = 0; i < arr.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 2500));
                await conn.sendMessage(m.chat, { text: arr[i], edit: key });
            }

            // Finalisasi Reward E-Receipt
            let finalReceipt = `🚕 *TAXI-ONLINE: E-RECEIPT*\n
*👤 Sopir:* ${name}
*📥 Total Tarikan:* ${order + 1}

*— [ PENDAPATAN ] —*
💵 *Argo:* +Rp ${uang.toLocaleString('id-ID')}
✨ *Exp:* +${exp.toLocaleString('id-ID')}

> _Kerja bagus, setoran taksi hari ini aman!_ 🌟`

            await new Promise(resolve => setTimeout(resolve, 2000));
            await conn.sendMessage(m.chat, { text: finalReceipt, edit: key });

            // Simpan Reward ke Database
            user.money += uang
            user.exp += exp
            user.taxi += 1

        } finally {
            // Membuka kembali kunci misi setelah selesai / jika terjadi error
            delete conn.misi[id]
        }

    } else {
        let warnMsg = `🚕 *SISTEM TAXI-ONLINE*\n\n> ⚠️ _Sistem mendeteksi mesin mobil Anda terlalu panas!_\n> _Silahkan istirahat dan dinginkan mesin selama_ *${timers}* _agar tidak turun mesin._`
        m.reply(warnMsg)
    }
}

handler.help = ['taxi']
handler.tags = ['rpg']
handler.command = /^(taxi|ngotaxi)$/i
handler.register = true
handler.group = true
handler.rpg = true

module.exports = handler;

// Fungsi format waktu (Helper)
function clockString(ms) {
    let h = Math.floor(ms / 3600000)
    let m = Math.floor(ms / 60000) % 60
    let s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}