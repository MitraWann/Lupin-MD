let handler = async (m, { conn, isAdmin }) => {
  // Cegah bot mengeksekusi dirinya sendiri jika nomor owner = nomor bot
  if (m.fromMe) throw 'Tidak bisa digunakan pada nomor bot itu sendiri.'
  
  // Cek apakah user memang sudah menjadi admin atau belum
  if (!isAdmin) throw 'Kamu kan bukan admin, gimana mau diturunin jabatannya?'
  
  // Proses demote (menurunkan jabatan)
  await conn.groupParticipantsUpdate(m.chat, [m.sender], "demote")
  m.reply('✅ Berhasil menurunkan jabatanmu dari Admin menjadi member biasa.')
}

handler.help = ['odemote']
handler.tags = ['owner']
handler.command = /^(ounadmin|odemote)$/i

// Pembatasan akses & syarat
handler.rowner = true    // Hanya bisa diakses oleh Real Owner
handler.group = true     // Hanya bisa digunakan di dalam grup
handler.botAdmin = true  // Bot harus jadi admin agar bisa melakukan demote

module.exports = handler