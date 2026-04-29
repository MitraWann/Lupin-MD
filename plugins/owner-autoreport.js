let handler = async (m, { conn, command }) => {
    let targetOwner = global.numberowner + '@s.whatsapp.net';

    // ==========================================
    // TAHAP 1: UJI COBA JALUR KOMUNIKASI
    // ==========================================
    if (command.toLowerCase() === 'teskirim') {
        await m.reply(`⏳ *Mencoba mengirim pesan darurat ke:* ${global.numberowner}...`);
        
        try {
            // Mengirim pesan langsung (Japri) menggunakan conn.sendMessage
            await conn.sendMessage(targetOwner, { 
                text: '🚨 *PESAN UJI COBA DARI WANN BOT* 🚨\n\nJika anda menerima pesan ini, berarti jalur komunikasi bot ke Owner terbuka lebar dan siap digunakan untuk Auto-Report!' 
            });
            return m.reply('✅ *SUKSES!* Pesan berhasil dikirim ke nomor Owner. Silakan cek chat pribadi dari bot.');
        } catch (e) {
            return m.reply(`❌ *GAGAL MENGIRIM!*\n\nTernyata bot tidak bisa mengirim pesan ke Owner.\n*Alasan:* ${e.message}`);
        }
    }

    // ==========================================
    // TAHAP 2: SIMULASI ERROR (Soft Crash)
    // ==========================================
    if (command.toLowerCase() === 'teserror') {
        await m.reply('⚠️ *MEMULAI SIMULASI BUG...*\n\nBot akan memicu error dalam 2 detik. CCTV akan segera menangkapnya!');
        
        setTimeout(() => {
            // Kita gunakan 'Unhandled Rejection' agar mesin tidak mati mendadak (Mencegah Instant Death)
            Promise.reject(new Error("🚨 SIMULASI BUG BERHASIL: Ini adalah pesan percobaan dari sistem keamanan Wann Bot!"));
        }, 2000);
        
        return;
    }

    // ==========================================
    // FITUR CEK STATUS
    // ==========================================
    if (command.toLowerCase() === 'autoreport') {
        return m.reply(`🛡️ *STATUS AUTO-REPORT* 🛡️\n\n✅ Sistem pemantau bug berjalan di latar belakang.\n🎯 Target Laporan: *${global.numberowner}*\n\n1️⃣ Ketik *.teskirim* untuk uji jalur.\n2️⃣ Ketik *.teserror* untuk uji error.`);
    }
}

// ==========================================
// MESIN CCTV LATAR BELAKANG (GLOBAL LISTENER)
// ==========================================
// Kita selalu memperbarui 'koneksi' agar bot tidak kehilangan arah
handler.before = async function (m, { conn }) {
    global.cctv_conn = conn; 
}

// Memasang CCTV menggunakan metode bawaan Node.js yang paling aman
if (!global.cctv_aktif) {
    global.cctv_aktif = true;

    // Menangkap error "Bug Fitur" (Unhandled Rejection)
    process.on('unhandledRejection', async (reason, promise) => {
        let conn = global.cctv_conn || global.conn;
        if (!conn) return;

        let targetOwner = global.numberowner + '@s.whatsapp.net';
        let errMsg = typeof reason === 'object' && reason.stack ? reason.stack : String(reason);

        let pesan = `🚨 *SYSTEM ERROR TERDETEKSI* 🚨\n\n`;
        pesan += `⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA\n\n`;
        pesan += `*📝 Log Error (Penyebab):*\n\`\`\`${errMsg.substring(0, 1000)}\`\`\`\n\n`;
        pesan += `_Autoreport log error Wann Bot_`;

        try {
            await conn.sendMessage(targetOwner, { text: pesan });
            console.log('✅ [AUTO-REPORT] Laporan SOS berhasil dikirim ke Owner!');
        } catch (e) {
            console.error('❌ [AUTO-REPORT] Gagal mengirim SOS:', e.message);
        }
    });

    // Menangkap error "Fatal Crash" (Uncaught Exception)
    process.on('uncaughtException', async (err) => {
        let conn = global.cctv_conn || global.conn;
        if (!conn) return;

        let targetOwner = global.numberowner + '@s.whatsapp.net';
        let errMsg = typeof err === 'object' && err.stack ? err.stack : String(err);
        
        let pesan = `💥 *FATAL CRASH TERDETEKSI* 💥\n\n`;
        pesan += `⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA\n\n`;
        pesan += `*📝 Log Error:*\n\`\`\`${errMsg.substring(0, 1000)}\`\`\`\n\n`;
        pesan += `_Sistem mungkin akan mati/restart setelah ini._`;

        try {
            await conn.sendMessage(targetOwner, { text: pesan });
            console.log('✅ [AUTO-REPORT] Laporan Darurat Fatal berhasil dikirim!');
        } catch (e) {}
    });
}

// ==========================================
// KONFIGURASI PLUGIN
// ==========================================
handler.help = ['autoreport', 'teserror', 'teskirim']
handler.tags = ['owner']
handler.command = /^(autoreport|teserror|teskirim)$/i
handler.owner = true 

module.exports = handler;