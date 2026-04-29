/**
 * Plugin: Send Code Snippet (AI Forwarded Message)
 * Fitur: Mengirimkan UI richResponseMessage berisi snippet code JavaScript
 * Author: Senior WhatsApp Bot Developer (Fixed)
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Masukkan nama plugin yang ingin dilihat kodenya!\n\nContoh: *${usedPrefix + command} downloader-ig.js*`);

    // [FIX 1] Keamanan: Menggunakan path.basename untuk memblokir total akses ke luar folder 'plugins'
    let pluginName = path.basename(text.trim());
    if (!pluginName.endsWith('.js')) pluginName += '.js';

    let pluginPath = path.join(process.cwd(), 'plugins', pluginName);

    if (!fs.existsSync(pluginPath)) {
        return m.reply(`❌ Plugin *${pluginName}* tidak ditemukan di folder plugins.`);
    }

    try {
        // Mengirimkan indikator loading standar
        //await m.reply(global.wait || '⏳ Sedang membaca dan memproses kode...');

        let codeContent = fs.readFileSync(pluginPath, 'utf8');
        let fileSize = fs.statSync(pluginPath).size; // [FIX 2] Mengambil ukuran asli file dalam bytes

        // Batasi panjang karakter untuk mencegah error payload WA (array object terlalu besar)
        const MAX_CHARS = 80000;
        if (codeContent.length > MAX_CHARS) {
            codeContent = codeContent.substring(0, MAX_CHARS) + '\n\n// ... [KODE TERPOTONG: Melebihi batas aman render syntax highlighter UI WA (80000 char)]';
        }
        
        // [FIX 3] Menghapus redeklarasi pluginName & Memperbaiki reference codeContent
        const headerText = `*🧩 Plugin :* ${pluginName}\n*🗃️ Ukuran :* ${(fileSize / 1024).toFixed(2)} KB`;

        // Tokenizer Sederhana untuk Syntax Highlighting
        let codeBlocks = [];
        let lastIndex = 0;
        let match;
        
        // Regex untuk mendeteksi: 1. Comment, 2. String, 3. Quote Mark, 4. Keywords, 5. Boolean/Null, 6. Number
        const tokenRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)|((["'`])(?:\\.|[^\\])*?\3)|\b(let|const|var|function|async|await|return|if|else|for|while|class|import|export|from|try|catch|new|this|typeof|instanceof|switch|case|break|continue|default|throw|delete|yield)\b|\b(true|false|null|undefined|NaN)\b|\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g;

        while ((match = tokenRegex.exec(codeContent)) !== null) {
            // Push teks biasa (sebelum token) dengan highlight 0
            if (match.index > lastIndex) {
                codeBlocks.push({ highlightType: 0, codeContent: codeContent.substring(lastIndex, match.index) });
            }

            // Tentukan tipe highlight berdasarkan grup regex yang cocok
            if (match[1]) {
                codeBlocks.push({ highlightType: 4, codeContent: match[0] }); // 4 = Komentar (Abu-abu/Hijau redup)
            } else if (match[2]) {
                codeBlocks.push({ highlightType: 2, codeContent: match[0] }); // 2 = String (Hijau)
            } else if (match[4]) {
                codeBlocks.push({ highlightType: 1, codeContent: match[0] }); // 1 = Keywords (Biru/Ungu)
            } else if (match[5] || match[6]) {
                codeBlocks.push({ highlightType: 3, codeContent: match[0] }); // 3 = Number & Boolean (Oranye/Merah)
            }
            
            lastIndex = tokenRegex.lastIndex;
        }

        // Masukkan sisa kode (jika ada) di akhir file
        if (lastIndex < codeContent.length) {
            codeBlocks.push({ highlightType: 0, codeContent: codeContent.substring(lastIndex) });
        }

        // Mengeksekusi relayMessage menggunakan raw payload dari Meta AI
        await conn.relayMessage(m.chat, {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            {
                                // Menyisipkan Header/Judul File agar lebih interaktif
                                messageType: 2,
                                messageText: headerText
                            },
                            {
                                messageType: 5,
                                codeMetadata: {
                                    codeLanguage: "javascript",
                                    codeBlocks: codeBlocks
                                }
                            }
                        ],
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            // [FIX 4] Penyesuaian format JID Meta AI
                            forwardedAiBotMessageInfo: { botJid: "867051314767696@s.whatsapp.net" },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        }, { 
            // Menyertakan pesan yang dikutip sebagai bagian dari payload
            quoted: m, 
            messageId: conn.generateMessageTag ? conn.generateMessageTag() : m.key.id 
        });

    } catch (e) {
        console.error('Error in sendcode plugin:', e);
        m.reply(global.eror || '❌ Terjadi kesalahan saat mencoba mengirim pesan raw. Pastikan Baileys mendukung tipe pesan ini.');
    }
}

// Metadata plugin
handler.help = ['readplugin <nama_plugin>'];
handler.tags = ['owner'];
handler.command = /^(readplugin|getplugin|sendcode)$/i; // Ditambahkan alias

// Atur keamanan dan limitasi sesuai kebutuhan
handler.limit = false; 
handler.group = false; 
handler.owner = true; // SANGAT DISARANKAN: Hanya owner yang bisa melihat source code bot

module.exports = handler;