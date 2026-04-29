/**
 * Nama Plugin: Fake Channel Forwarder
 * Deskripsi: Mengirim pesan teks atau media dengan manipulasi metadata Forwarded Channel
 * Author: Senior WA Bot Developer
 */

let handler = async (m, { conn, text, usedPrefix, command, args, isOwner, isAdmin, isPrems }) => {
    // Menangkap pesan yang di-reply (jika ada) atau pesan saat ini
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    // Validasi input: Harus ada teks atau media yang di-reply
    if (!text && !m.quoted) {
        throw `*Contoh:* ${usedPrefix}${command} Pengumuman penting!\n\n_Atau balas (reply) media/pesan dengan perintah ini._`;
    }

    // Mengambil teks dari argumen atau dari pesan yang di-reply
    let msgText = text || q.text || '';

    await m.reply(global.wait);

    try {
        // Struktur contextInfo sesuai dengan yang diminta
        const customContextInfo = {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363208449943317@newsletter',
                newsletterName: 'Wann | TulipNex',
                serverMessageId: 127
            }
        };

        // Jika yang di-reply adalah media (gambar/video)
        if (/image|video/g.test(mime)) {
            let media = await q.download();
            let isVideo = /video/g.test(mime);
            
            await conn.sendMessage(m.chat, {
                [isVideo ? 'video' : 'image']: media,
                caption: msgText,
                contextInfo: customContextInfo
            }, { quoted: m });
            
        } else {
            // Jika hanya teks biasa
            await conn.sendMessage(m.chat, {
                text: msgText,
                contextInfo: customContextInfo
            }, { quoted: m });
        }

    } catch (e) {
        console.error(e);
        // Menggunakan standard error handler global
        m.reply(global.eror);
    }
};

// Metadata Handler
handler.help = ['fakechannel'].map(v => v + ' <teks/reply>');
handler.tags = ['tools'];
handler.command = /^(fchan|fakechannel|sponsor)$/i;

// Pengaturan akses & limitasi
handler.limit = true;

module.exports = handler;