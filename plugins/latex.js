/**
 * Nama Plugin: Native LaTeX Renderer (Meta AI Spoofing)
 * Deskripsi: Menggunakan trik botForwardedMessage untuk merender LaTeX secara native di WA.
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validasi input
    if (!text) {
        let caption = `*Contoh Penggunaan:*\n${usedPrefix}${command} v_0 = \\frac{s - \\frac{1}{2}at^2}{t}`
        return m.reply(caption)
    }

    // Membungkus input dengan delimiternya jika user belum menambahkannya
    let latexString = text.includes('\\[') ? text : `\\[${text}\\]`;

    try {
        // Menggunakan struktur payload identik 100% dengan trace WhatsApp aslinya
        const content = {
            messageContextInfo: {
                deviceListMetadata: {
                    senderKeyIndexes: [],
                    recipientKeyIndexes: []
                },
                deviceListMetadataVersion: 2
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        submessages: [
                            {
                                messageType: 8,
                                latexMetadata: {
                                    expressions: [
                                        {
                                            latexExpression: latexString,
                                            // Memasukkan fallback URL & dimensi agar WA client tidak crash/fallback ke teks
                                            url: "https://mmg.whatsapp.net/v/t58.87448-6/549136560_1960957274523660_5698552844579059040_n.enc?ccb=11-4&oh=01_Q5Aa4QGywkxWOo-Lnrj8FxAlJlen4vdD1oMfT_aMR0PUiMx8EQ&oe=69D71B9E&_nc_sid=5e03e0",
                                            width: 300,
                                            height: 300,
                                            fontHeight: 83.33333333333334
                                        }
                                    ],
                                    text: latexString
                                }
                            }
                        ],
                        messageType: 1,
                        contextInfo: {
                            forwardingScore: 2,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: "259786046210223@bot"
                            },
                            forwardOrigin: 4,
                            botMessageSharingInfo: {
                                botEntryPointOrigin: 1,
                                forwardScore: 2
                            }
                        }
                    }
                }
            }
        };

        // Mengirimkan payload menggunakan relayMessage
        await conn.relayMessage(m.chat, content, {
            messageId: m.key.id 
        });

    } catch (e) {
        console.error('Gagal mengirim Native LaTeX:', e);
        m.reply(global.eror || '❌ Gagal memproses payload LaTeX.');
    }
}

handler.help = ['latexnative'].map(v => v + ' <rumus>')
handler.tags = ['tools']
handler.command = /^(latexnative|rumusnative)$/i
handler.limit = true

module.exports = handler