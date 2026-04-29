/**
 * Plugin: RPG Ngojek
 * Description: Simulasi ojek online dengan modern UX & receipt UI
 */

let handler = async (m, { conn, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  
  // Kalkulasi Timer Cooldown (5 Menit / 300.000 ms)
  let __timers = (new Date - user.lastngojek)
  let _timers = (300000 - __timers)
  let timers = clockString(_timers) 
  
  // FIX: Menggunakan username dari database (hasil register) atau nama profil WA, bukan nomor telepon
  let name = user.name || m.pushName || 'Driver'
  let order = user.ojek || 0
  
  if (new Date - user.lastngojek > 300000) {
      user.lastngojek = new Date * 1

      // Kalkulasi Reward (Uang minimal Rp 5.675)
      let randomaku4 = Math.floor(Math.random() * 5)
      let randomaku5 = Math.floor(Math.random() * 10) + 1

      let uang = 5675 + (randomaku4 * 5000)
      let exp = (randomaku5 * 200)

      // Animasi UI Modern
      let arr = [
          `🛵 *OJEK-ONLINE: MENCARI PENUMPANG*\n\n> 🔎 _Memindai area sekitar..._`, 
          `🛵 *OJEK-ONLINE: PENUMPANG DITEMUKAN*\n\n> 📍 _Titik Jemput:_ Perempatan Jalan\n> 🏁 _Tujuan:_ Kota Seberang\n> 🚦 _Sedang menuju lokasi penumpang..._`,
          `🛵 *OJEK-ONLINE: PERJALANAN DIMULAI*\n\n🚶🛵⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬜⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️\n\n> 💨 _Mengantar penumpang dengan aman..._`, 
          `🛵 *OJEK-ONLINE: TIBA DI TUJUAN*\n\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛\n⬛⬜⬜⬛⬛⬜⬜⬜⬛⬛\n⬛⬛⬛⬛⬛⬛⬛🛵⬛⬛\n🏘️🏘️🏘️🏘️🌳  🌳 🏘️\n\n> ✅ _Penumpang telah turun. Memproses pembayaran..._`
      ]

      let { key } = await conn.sendMessage(m.chat, {text: '🔍 *Aplikasi Ojek* | _Menyalakan GPS....._'}, { quoted: m })
      
      // Looping Animasi Edit Message (Dipercepat menjadi 2.5 detik per frame agar lebih responsif)
      for (let i = 0; i < arr.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 2500));
          await conn.sendMessage(m.chat, { text: arr[i], edit: key });
      }

      // Finalisasi Reward E-Receipt
      let finalReceipt = `🛵 *OJEK-ONLINE: E-RECEIPT*\n
*👤 Driver:* ${name}
*📥 Total Tarikan:* ${order + 1}

*— [ PENDAPATAN ] —*
💵 *Uang:* +Rp ${uang.toLocaleString('id-ID')}
✨ *Exp:* +${exp.toLocaleString('id-ID')}

> _Terima kasih telah bekerja keras hari ini!_ 🌟`

      await new Promise(resolve => setTimeout(resolve, 2000));
      await conn.sendMessage(m.chat, { text: finalReceipt, edit: key });

      // Memasukkan data ke database
      user.money += uang
      user.exp += exp
      user.ojek += 1

  } else {
      let warnMsg = `🛵 *SISTEM OJEK-ONLINE*\n\n> ⚠️ _Sistem mendeteksi Anda kelelahan!_\n> _Silahkan ngopi dulu di pangkalan selama_ *${timers}* _agar tidak kecelakaan._`
      m.reply(warnMsg)
  }
}

handler.help = ['ojek']
handler.tags = ['rpg']
handler.command = /^(ojek|ngojek|gojek)$/i
handler.register = true
handler.rpg = true

module.exports = handler

// Fungsi format waktu (Helper)
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}