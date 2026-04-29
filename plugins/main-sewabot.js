let handler = async (m, { conn, command }) => {
    // Definisi nomor owner (diambil dari requestFrom atau bisa diganti sesuai nomor Boss)
    let nomorOwner = '6282215415550'; 

    let txt = `╔╣ *PREMIUM USER*
║ • 10.000 Limit
║ • Full Akses Fitur
╚══╣ *Harga :* Rp.10.000 / bulan

╔╣ *SEWA BOT*
║ • Dapat Premium
║ • Bebas Invite ke 1 Grup
╚══╣ *Harga :* Rp.15.000 / bulan

- Pembayaran via *Dana, ShopeePay, Qris, Bank*
- Whatsapp Multi Device
- Run via Panel (Always ON)

Silahkan Menghubungi Owner Untuk Sewa Bot Melalui : wa.me/${nomorOwner}`;

    try {
        await conn.relayMessage(m.chat, {
            requestPaymentMessage: {
                currencyCodeIso4217: 'IDR',
                amount1000: 15000000, // 15.000 * 1000 (Agar muncul harga Rp 15.000 di struk)
                requestFrom: `${nomorOwner}@s.whatsapp.net`,
                noteMessage: {
                    extendedTextMessage: {
                        text: txt,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                showAdAttribution: false
                            }
                        }
                    }
                }
            }
        }, {});
    } catch (error) {
        console.error('Error SewaBot:', error);
        m.reply('❌ Gagal menampilkan menu sewa bot.');
    }
};

handler.help = ['sewabot'];
handler.tags = ['main'];
handler.command = /^(sewa|sewabot)$/i;

module.exports = handler;