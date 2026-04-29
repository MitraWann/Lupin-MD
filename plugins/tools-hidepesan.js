/**
 * STEGANOGRAPHY TOOL (BUFFER INJECTION)
 * Location: ./plugins/tools-stego.js
 * Feature: Menyembunyikan dan membaca pesan rahasia di dalam gambar.
 */

const fs = require('fs');
const { exec } = require('child_process');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (command === 'hide') {
        if (!/image/.test(mime)) return m.reply(`📩 Balas gambar dengan perintah: *${usedPrefix + command} pesan rahasia*`);
        if (!text) return m.reply(`Mana pesan rahasianya?\nContoh: *${usedPrefix + command} Password akun adalah 123*`);

        await m.reply(global.wait);

        try {
            let img = await q.download();
            // Penanda unik untuk mendeteksi awal pesan rahasia dalam buffer
            let separator = '||TULIPNEX-SECRET||';
            let secretBuffer = Buffer.from(separator + text, 'utf-8');
            
            // Gabungkan buffer gambar asli dengan pesan rahasia
            let combinedBuffer = Buffer.concat([img, secretBuffer]);

            await conn.sendFile(m.chat, combinedBuffer, 'secret.jpg', '✅ *Pesan Berhasil Disisipkan!*\n\nGambar ini sekarang mengandung pesan rahasia. Gunakan *.read* pada gambar ini untuk melihatnya.', m);
        } catch (e) {
            console.error(e);
            m.reply(global.eror);
        }
    }

    if (command === 'read') {
        if (!/image/.test(mime)) return m.reply('📩 Balas gambar yang mengandung pesan rahasia!');

        await m.reply('🔍 *Memindai struktur data gambar...*');

        try {
            let img = await q.download();
            let dataString = img.toString('utf-8');
            let separator = '||TULIPNEX-SECRET||';

            if (!dataString.includes(separator)) {
                return m.reply('❌ Tidak ditemukan pesan rahasia TulipNex dalam gambar ini.');
            }

            let secretText = dataString.split(separator)[1];
            
            let result = `🕵️ *STEGANOGRAPHY RESULT*\n`;
            result += `──────────────────\n`;
            result += `💬 *Pesan:* ${secretText}\n`;
            result += `──────────────────\n`;
            result += `> *Confidential Data - TulipNex Security*`;

            m.reply(result);
        } catch (e) {
            console.error(e);
            m.reply('Gagal membaca data rahasia.');
        }
    }
};

handler.help = ['hide <pesan>', 'read'];
handler.tags = ['tools'];
handler.command = /^(hide|read|stego)$/i;
handler.limit = true;

module.exports = handler;