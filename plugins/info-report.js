let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Peringatan jika pesan kosong
    if (!text) {
        return m.reply(
            `⚠️ *Format Salah!*\n\n` +
            `Silakan tulis detail error-nya.\n\n` +
            `*Contoh:*\n` +
            `> ${usedPrefix + command} Boss, fitur .cuaca tidak muncul balasannya.`
        );
    }

    if (text.length < 10) return m.reply(`⚠️ Laporan terlalu singkat! Minimal 10 huruf.`);
    if (text.length > 1000) return m.reply(`⚠️ Laporan terlalu panjang! Maksimal 1000 huruf.`);

    // 2. Mengambil informasi pelapor dengan cara yang aman (Fallbacks)
    let senderName = await conn.getName(m.sender) || 'User';
    let location = m.isGroup ? `Grup: ${await conn.getName(m.chat) || 'Grup Tidak Diketahui'}` : 'Chat Pribadi (Japri)';

    // ==========================================
    // PERBAIKAN 1: FORMAT TAG
    // ==========================================
    let tag = `@${m.sender.replace(/@.+/, '')}`;

    // 3. Merakit pesan laporan
    let reportMessage = `🚨 *TIKET LAPORAN BUG MASUK* 🚨\n\n` +
                        `👤 *Pelapor:* ${senderName} (${tag})\n` +
                        `📍 *Lokasi:* ${location}\n` +
                        `💬 *Detail Laporan:*\n"${text}"\n\n` +
                        `_Balas laporan ini dengan mengklik tag nomor pelapor._`;

    // 4. MENGAMBIL NOMOR OWNER DENGAN SANGAT AMAN (ANTI-CRASH)
    let ownerGroup = global.owner || [];
    let isSuccess = false;

    // Jika global.owner kosong, bot akan menggunakan nomor bot itu sendiri sebagai tempat lapor
    if (ownerGroup.length === 0) {
        ownerGroup = [conn.user.jid.split('@')[0]]; 
    }

    for (let i = 0; i < ownerGroup.length; i++) {
        // Logika aman untuk membaca berbagai jenis format data owner di database
        let ownerNumber = ownerGroup[i];
        if (Array.isArray(ownerNumber)) ownerNumber = ownerNumber[0]; // Jika formatnya [['628xx', 'Boss']]
        
        // Membersihkan karakter selain angka, lalu ubah ke format JID WhatsApp
        ownerNumber = ownerNumber.toString().replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        try {
            // ==========================================
            // PERBAIKAN 2: JURUS BOM TAG
            // ==========================================
            await conn.sendMessage(ownerNumber, { 
                text: reportMessage, 
                mentions: [m.sender],
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            });
            isSuccess = true;
        } catch (e) {
            console.error(`Gagal mengirim laporan ke Boss (${ownerNumber}):`, e.message);
        }
    }

    // 5. Konfirmasi ke user
    if (isSuccess) {
        m.reply(`✅ *Laporan Berhasil Terkirim!*\n\nTerima kasih, laporan Anda sudah diteruskan langsung ke WhatsApp pribadi Owner untuk segera ditindaklanjuti.`);
    } else {
        m.reply(`❌ *Gagal mengirim laporan!*\n\nSistem tidak dapat menemukan nomor kontak Owner.`);
    }
}

// ==========================================
// KONFIGURASI PLUGIN
// ==========================================
handler.help = ['report <pesan>', 'bug <pesan>', 'lapor <pesan>']
handler.tags = ['info']
handler.command = /^(report|bug|lapor)$/i
handler.limit = true 

module.exports = handler