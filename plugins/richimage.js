/**
 * Plugin: Rich Image Message (Meta AI UI)
 * Deskripsi: Mendemonstrasikan penggunaan messageType: 3 (Media/Image) 
 * yang digabung dengan messageType: 2 (Teks) dalam satu Carousel (messageType: 1).
 */

const fetch = require('node-fetch');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Memberikan indikator loading (asumsi global.wait sudah diset di config)
    m.reply(global.wait || '⏳ _Sedang memproses UI Rich Message..._');

    try {
        // Import Baileys secara dinamis untuk menghindari error Top-Level Await (ESM)
        const { generateWAMessageContent } = await import('@adiwajshing/baileys');

        // 1. Menggunakan URL gambar statis yang dijamin valid untuk mencegah fetch error
        let imageUrl = 'https://d.uguu.se/DWWnkRvo.png';

        // 2. Upload gambar menggunakan generateWAMessageContent langsung dari URL
        // Ini memastikan metadata gambar diunggah ke CDN WhatsApp
        let content = await generateWAMessageContent(
            { image: { url: imageUrl } }, 
            { upload: conn.waUploadToServer }
        );

        // 3. VALIDASI KRUSIAL: Mencegah blank/gray box akibat gagal upload CDN
        if (!content.imageMessage || !content.imageMessage.url) {
            return m.reply('❌ Gagal mengunggah gambar ke CDN WhatsApp. Pastikan fungsi conn.waUploadToServer di bot Anda berjalan normal.');
        }

        // 4. FORCE METADATA: WhatsApp sangat ketat soal dimensi pada UI ini
        content.imageMessage.width = content.imageMessage.width || 800;
        content.imageMessage.height = content.imageMessage.height || 800;

        // 5. Susun struktur Rich Response Message
        let payload = {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        // Container Induk wajib menggunakan tipe 1
                        messageType: 1, 
                        submessages: [
                            {
                                // Menyisipkan Media/Gambar (Berada di atas)
                                messageType: 3, 
                                imageMessage: content.imageMessage
                            },
                            {
                                // Menyisipkan Teks (Berada di bawah gambar)
                                messageType: 2, 
                                messageText: text 
                                    ? `*Pesan Anda:* ${text}` 
                                    : "✨ *UI Gambar Native*\n\nMasalah kotak abu-abu (gray box) berhasil diatasi!"
                            }
                        ],
                        contextInfo: {
                            mentionedJid: [m.sender],
                            isForwarded: true,
                            forwardOrigin: 4,
                            // Atribut ini memicu label "Meta AI"
                            forwardedAiBotMessageInfo: { 
                                botJid: "867051314767696@s.whatsapp.net" 
                            }
                        }
                    }
                }
            }
        };

        // 4. Kirim payload menggunakan Raw Protobuf (relayMessage)
        await conn.relayMessage(m.chat, payload, { messageId: m.key.id });

    } catch (e) {
        console.error(e);
        m.reply(global.eror || '❌ Terjadi kesalahan saat memproses gambar.');
    }
};

handler.help = ['richimage <teks>'];
handler.tags = ['tools'];
handler.command = /^(richimage|sendimageui)$/i;
// handler.limit = true; // Uncomment jika ingin dibatasi limit

module.exports = handler;