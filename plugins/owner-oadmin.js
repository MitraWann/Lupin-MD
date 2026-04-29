let handler = async (m, { conn, isAdmin }) => {
  // Cegah bot mengeksekusi dirinya sendiri jika nomor owner = nomor bot
  if (m.fromMe) throw 'Tidak bisa digunakan pada nomor bot itu sendiri.'
  
  // Cek apakah user memang sudah menjadi admin atau belum
  if (isAdmin) throw 'Kamu kan sudah jadi admin, ngapain minta naik jabatan lagi?'
  
  // Proses promote (menaikkan jabatan)
  await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote")
  m.reply('✅ Berhasil menaikkan jabatanmu menjadi Admin grup.')
}

handler.help = ['opromote']
handler.tags = ['owner']
handler.command = /^(oadmin|opromote)$/i

// Pembatasan akses & syarat
handler.mods = true    // Hanya bisa diakses oleh Real Owner
handler.group = true     // Hanya bisa digunakan di dalam grup
handler.botAdmin = true  // Bot harus jadi admin agar bisa melakukan promote


module.exports = handler