let handler = async (m, { conn, usedPrefix, command }) => {
    
    // 1. Bypass ESM Error dengan Dynamic Import
    const { 
       proto,
       prepareWAMessageMedia,
       generateWAMessageFromContent
    } = await import('@adiwajshing/baileys');

    // 2. Definisikan Fungsi sendButton (Helper Lokal)
    const sendButton = async (jid, buttons = [], quoted = null, opts = {}) => {
        if (!conn.user?.id) throw new Error("User not authenticated");
        if (!Array.isArray(buttons) || !buttons.length) throw new Error("Buttons must be a non-empty array");

        const {
            title = "",
            subtitle = "",
            header = "",
            content = "",
            footer = "",
            image = null
        } = opts;

        const processedButtons = buttons.map((btn, i) => {
            if (!btn.name || !btn.buttonParamsJson) throw new Error(`Button[${i}] invalid format`);
            return {
                name: btn.name,
                buttonParamsJson: btn.buttonParamsJson
            };
        });

        let headerContent;
        if (image) {
            const media = typeof image === "string" ? { image: { url: image } } : { image };
            const prepared = await prepareWAMessageMedia(media, { upload: conn.waUploadToServer });
            headerContent = {
                title: title || undefined,
                subtitle: subtitle || undefined,
                hasMediaAttachment: true,
                imageMessage: prepared.imageMessage
            };
        } else if (header || title) {
            headerContent = {
                title: title || header,
                subtitle: subtitle || undefined,
                hasMediaAttachment: false
            };
        }

        const interactive = proto.Message.InteractiveMessage.create({
            ...(headerContent && { header: headerContent }),
            ...(content && { body: { text: content } }),
            ...(footer && { footer: { text: footer } }),
            contextInfo: {
                mentionedJid: conn.parseMention ? conn.parseMention(content) : []
            },
            nativeFlowMessage: {
                buttons: processedButtons
            }
        });

        const msg = generateWAMessageFromContent(
            jid,
            {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: interactive
                    }
                }
            },
            {
                userJid: conn.user.id,
                quoted
            }
        );

        await conn.relayMessage(jid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [
                                {
                                    tag: "native_flow",
                                    attrs: { v: "9", name: "mixed" }
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        return msg;
    };

    // 3. Persiapan Data Button
    const buttons = [
        {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: "👤 OWNER",
                id: '.owner'
            }),
        },
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: "🌐 Website Resmi",
                url: "https://github.com/BOTCAHX/RTXZY-MD",
                merchant_url: "https://github.com/BOTCAHX/RTXZY-MD"
            })
        },
        {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
                display_text: "📝 Copy Kode",
                copy_code: "MOBIUS-BOT-2026"
            })
        },
        {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
                title: "📂 PILIH MENU",
                sections: [{
                    rows: [{
                        title: "Owner Bot",
                        description: "Hubungi pengembang bot",
                        id: ".owner"
                    }, {
                        title: "Runtime Bot",
                        description: "Cek masa aktif server",
                        id: ".run"
                    }]
                }]
            })
        }
    ];

    // 4. Eksekusi Pengiriman
    await m.reply(global.wait);
    
    try {
        await sendButton(m.chat, buttons, m, {
            content: `Halo @${m.sender.split('@')[0]}!\n\nIni adalah demo pesan interaktif menggunakan sistem *Native Flow*. Silahkan pilih tombol di bawah.`,
            footer: global.wm,
            image: 'https://telegra.ph/file/70e8de9b1879568954f09.jpg' 
        });
    } catch (e) {
        console.error(e);
        m.reply("Gagal mengirim pesan tombol. Cek log console untuk detailnya.");
    }
}

handler.help = ['testbutton']
handler.tags = ['main', 'tools']
handler.command = /^(testbutton|btn)$/i
handler.limit = true

module.exports = handler