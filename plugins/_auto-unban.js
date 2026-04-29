let handler = m => m

handler.before = async function (m, { conn }) {
    // 1. Buat timer pembatas (Pengecekan massal berjalan 1 menit sekali)
    global.lastUnbanCheck = global.lastUnbanCheck || 0
    let waktuSekarang = Date.now()

    if (waktuSekarang - global.lastUnbanCheck > 60000) {
        global.lastUnbanCheck = waktuSekarang // Reset timer

        let users = global.db.data.users
        
        // 2. Lakukan penyapuan (Global Sweep) ke semua data user
        for (let jid in users) {
            let user = users[jid]
            
            // Cari user yang sedang di-ban dan punya timer
            if (user && user.banned && user.bannedTime > 0) {
                
                // Jika waktu saat ini sudah melewati batas hukuman
                if (waktuSekarang > user.bannedTime) {
                    
                    // Cabut status banned dan reset timer
                    user.banned = false
                    user.bannedTime = 0
                    
                    // Ambil nomor dari JID untuk keperluan tag
                    let nomorUser = jid.split('@')[0]
                    
                    // 3. Pesan notifikasi dengan Tag User
                    let teks = `✅ *INFO UNBAN OTOMATIS*\n\n` +
                               `Halo @${nomorUser},\n` +
                               `Masa hukuman (banned) kamu telah berakhir. Sekarang kamu bisa menggunakan layanan bot kembali. Tolong patuhi peraturan yang ada ya!`

                    try {
                        // Kirim pesan langsung ke ID user (jid) dengan mention aktif
                        await conn.sendMessage(jid, { 
                            text: teks,
                            mentions: [jid] // Wajib ada agar tag @nomor berubah menjadi biru/bisa di-klik
                        })
                    } catch (e) {
                        console.error(`⚠️ Gagal mengirim notifikasi unban otomatis ke ${jid}.`)
                    }
                }
            }
        }
    }
}

module.exports = handler