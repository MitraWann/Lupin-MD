const { generateSession, generateEmail, saveEmail, getInbox } = require('../lib/tempmail');

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // Memanggil database spesifik untuk user yang mengirim pesan
    let user = global.db.data.users[m.sender];
    
    // Menentukan sub-command
    let action = args[0] ? args[0].toLowerCase() : '';

    if (action === 'create' || action === 'buat') {
        m.reply(global.wait);
        try {
            // Membuat session dinamis
            const session = generateSession();
            
            // Hit API pembuatan email
            const generated = await generateEmail(session);
            const email = generated?.result?.email ?? generated?.email ?? generated;

            if (!email || typeof email !== 'string') throw new Error('Gagal mendapatkan email dari API');

            // Menyimpan status email di server multi-tools
            await saveEmail(email, session);

            // AUTO-SAVE: Menyimpan email dan session ke dalam database user bot
            user.tempmail = { email, session };

            let txt = `📧 *T E M P - M A I L*\n\n`;
            txt += `*Email:* ${email}\n\n`;
            txt += `_✅ Email berhasil dibuat dan sesi telah disimpan otomatis di database!_\n\n`;
            txt += `Gunakan perintah *${usedPrefix + command} check* untuk mengecek pesan masuk.`;

            m.reply(txt);
        } catch (e) {
            console.error('[TempMail Error - Create]:', e);
            m.reply(global.eror);
        }

    } else if (action === 'check' || action === 'cek') {
        // Cek apakah user punya data tempmail di database
        if (!user.tempmail) return m.reply(`Kamu belum memiliki email aktif!\nSilakan buat terlebih dahulu dengan perintah: *${usedPrefix + command} create*`);

        m.reply(global.wait);
        try {
            // Mengambil email dan session langsung dari database tanpa perlu diketik user
            const { email, session } = user.tempmail;
            const inbox = await getInbox(email, session);

            if (!inbox || inbox.length === 0) {
                return m.reply(`📭 *Kotak Masuk Kosong*\n\nEmail: *${email}*\n\n_Belum ada pesan yang masuk. Silakan tunggu beberapa saat dan jalankan ulang perintah ini._`);
            }

            let txt = `📬 *I N B O X*\n\n`;
            txt += `Email: *${email}*\n\n`;
            
            inbox.forEach((msg, i) => {
                txt += `*${i + 1}. Dari:* ${msg.sender || 'Tidak diketahui'}\n`;
                txt += `*Subjek:* ${msg.subject || 'Tanpa Subjek'}\n`;
                txt += `*Tanggal:* ${msg.date || '-'}\n`;
                txt += `*Pesan:*\n${msg.message || msg.text || '(Isi pesan tidak terbaca / Kosong)'}\n`;
                txt += `\n──────────────────\n\n`;
            });

            m.reply(txt.trim());
        } catch (e) {
            console.error('[TempMail Error - Check]:', e);
            m.reply(global.eror);
        }

    } else if (action === 'delete' || action === 'reset') {
        // Cek apakah user punya data tempmail
        if (!user.tempmail) return m.reply(`Kamu tidak memiliki sesi email yang aktif!`);
        
        // Menghapus data tempmail dari database user
        user.tempmail = null;
        m.reply(`✅ *Sesi TempMail berhasil dihapus!*\n\nData email telah di-reset. Kamu bisa membuat email baru lagi dengan perintah: *${usedPrefix + command} create*`);

    } else if (action === 'get') {
        // Cek apakah user punya data tempmail
        if (!user.tempmail) return m.reply(`Kamu tidak memiliki sesi email yang aktif!`);
        
        // Mengirimkan HANYA email bersih tanpa teks tambahan
        m.reply(user.tempmail.email);

    } else {
        // Menu Bantuan (Default)
        let txt = `*PANDUAN PENGGUNAAN TEMPMAIL*\n\n`;
        txt += `*1. Membuat Email Baru:*\n> ${usedPrefix + command} create\n\n`;
        txt += `*2. Mengecek Kotak Masuk (Inbox):*\n> ${usedPrefix + command} check\n\n`;
        txt += `*3. Menyalin Alamat Email Aktif:*\n> ${usedPrefix + command} get\n\n`;
        txt += `*4. Menghapus Sesi Email Saat Ini:*\n> ${usedPrefix + command} delete\n\n`;
        txt += `_Status Saat Ini:_ ${user.tempmail ? `Aktif (${user.tempmail.email})` : 'Tidak Aktif'}`;
        
        m.reply(txt);
    }
};

handler.help = ['tempmail2']
handler.tags = ['tools']
handler.command = /^(tempmail2|mail2|temp2)$/i

// Flag keamanan (Mengurangi saldo limit user)
handler.limit = true
handler.private = true

module.exports = handler