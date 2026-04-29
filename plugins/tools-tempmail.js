/**
 * Plugin: Tempmail (akunlama.com)
 * Lokasi: /plugins/tools-tempmail.js
 * Feature: Generate, Check & Delete Temporary Email
 */

const { generateRecipient, getInbox } = require('../lib/scraper-tempmail');

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // Validasi & Inisialisasi Database User
    let user = global.db.data.users[m.sender];
    if (typeof user !== 'object') global.db.data.users[m.sender] = {};
    
    let action = args[0] ? args[0].toLowerCase() : '';

    switch (action) {
        // ==========================================
        // ACTION: CREATE EMAIL
        // ==========================================
        case 'create':
        case 'buat': {
            await m.reply(global.wait || '⏳ Sedang membuat email...');
            try {
                // Mengambil custom username dari args[1] jika ada (hanya mengizinkan huruf & angka)
                let customName = args[1] ? args[1].toLowerCase().replace(/[^a-z0-9]/g, '') : null;
                
                // Gunakan customName jika ada, jika tidak gunakan generateRecipient()
                let recipient = customName || generateRecipient();
                
                user.tempmail_recipient = recipient; // Simpan ke database
                
                let msg = `✅ *Email Berhasil Dibuat!*\n\n`;
                msg += `📧 *Email:* ${recipient}@akunlama.com\n\n`;
                msg += `> Gunakan email di atas untuk mendaftar/menerima OTP.\n`;
                msg += `> Untuk mengecek pesan masuk, ketik: *${usedPrefix}${command} check*\n`;
                msg += `> Untuk menghapus email ini, ketik: *${usedPrefix}${command} delete*`;
                
                return m.reply(msg);
            } catch (e) {
                console.error(e);
                return m.reply(global.eror || '❌ Terjadi kesalahan saat membuat email.');
            }
        }

        // ==========================================
        // ACTION: CHECK INBOX
        // ==========================================
        case 'check':
        case 'cek': {
            let recipient = user.tempmail_recipient;
            if (!recipient) {
                return m.reply(`❌ Anda belum membuat email sementara.\nKetik *${usedPrefix}${command} create* untuk membuat baru.`);
            }

            await m.reply(global.wait || '⏳ Sedang mengecek kotak masuk...');
            try {
                let res = await getInbox(recipient);

                if (!res.status) {
                    return m.reply(`📭 Kotak masuk kosong untuk ${recipient}@akunlama.com\`.\n\n_Silakan tunggu beberapa saat dan coba cek lagi._`);
                }

                let replyMsg = `📬 *KOTAK MASUK: ${recipient}@akunlama.com*\nJumlah Pesan: ${res.total}\n\n`;

                // Looping hasil pesan dari scraper
                for (let msg of res.messages) {
                    replyMsg += `──────────────────\n`;
                    replyMsg += `👤 *Dari:* ${msg.from}\n`;
                    replyMsg += `📑 *Subjek:* ${msg.subject}\n`;
                    if (msg.token) {
                        replyMsg += `🔑 *Token Terdeteksi:* ${msg.token}\n`;
                    }
                    replyMsg += `💬 *Pesan:*\n${msg.text}\n`;
                }

                if (res.total > 5) {
                    replyMsg += `\n_...dan ${res.total - 5} pesan lainnya._`;
                }

                return m.reply(replyMsg);
            } catch (e) {
                console.error(e);
                return m.reply(global.eror || '❌ Terjadi kesalahan saat mengecek kotak masuk. Mungkin server API sedang sibuk.');
            }
        }

        // ==========================================
        // ACTION: DELETE EMAIL
        // ==========================================
        case 'delete':
        case 'hapus': {
            let recipient = user.tempmail_recipient;
            if (!recipient) {
                return m.reply(`❌ Anda tidak memiliki email aktif untuk dihapus.`);
            }

            delete user.tempmail_recipient; // Hapus data sesi dari database user
            return m.reply(`🗑️ *Email Dihapus!*\n\nEmail ${recipient}@akunlama.com beserta isinya telah dihapus dari data Anda.`);
        }

        // ==========================================
        // ACTION: GET EMAIL (UNTUK COPY)
        // ==========================================
        case 'get': {
            let recipient = user.tempmail_recipient;
            if (!recipient) {
                return m.reply(`❌ Anda belum membuat email sementara.\nKetik *${usedPrefix}${command} create* untuk membuat baru.`);
            }

            // Mengirimkan HANYA email tanpa teks lain
            return m.reply(`${recipient}@akunlama.com`);
        }

        // ==========================================
        // ACTION: DEFAULT / HELP MENU
        // ==========================================
        default: {
            let help = `📧 *TEMPMAIL GENERATOR* 📧\n\n`;
            help += `Layanan email sementara sekali pakai (Disposable Email).\n\n`;
            help += `*Panduan Penggunaan:*\n`;
            help += `• *${usedPrefix}${command} create* \n> Membuat email sementara baru secara acak.\n`;
            help += `• *${usedPrefix}${command} create <nama>* \n> Membuat email custom (contoh: *${usedPrefix}${command} create mitra*).\n`;
            help += `• *${usedPrefix}${command} check* \n> Mengecek kotak masuk dari email yang aktif.\n`;
            help += `• *${usedPrefix}${command} get* \n> Menampilkan teks email saja agar mudah disalin.\n`;
            help += `• *${usedPrefix}${command} delete* \n> Menghapus email yang sedang aktif.\n\n`;
            
            let activeEmail = user.tempmail_recipient ? `${user.tempmail_recipient}@akunlama.com` : 'Belum ada email aktif';
            help += `Email Aktif: ${activeEmail}\n`
            
            return m.reply(help);
        }
    }
};

handler.help = ['tempmail'];
handler.tags = ['tools'];
handler.command = /^(tempmail|mail|temp)$/i;
handler.limit = true; // Mengurangi limit sesuai format lama
handler.private = true;

module.exports = handler;