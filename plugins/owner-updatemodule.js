/**
 * Plugin: NPM Module Updater
 * Description: Mengupdate module spesifik ke versi terbaru (@latest) atau melakukan npm update aman.
 */

const { exec } = require('child_process');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Validasi input
    if (!args[0]) {
        let txt = `Masukkan nama module yang ingin diupdate!\n\n`;
        txt += `*Contoh Penggunaan:*\n`;
        txt += `> ${usedPrefix + command} axios \n_(Update 1 module secara paksa ke versi terbaru)_\n\n`;
        txt += `> ${usedPrefix + command} all \n_(Menjalankan npm update standar dan aman untuk semua module)_`;
        return m.reply(txt);
    }

    let target = args[0].toLowerCase();
    let cmd = '';

    if (target === 'all') {
        cmd = 'npm update';
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        await m.reply(global.wait || '⏳ _Memulai proses `npm update`...\nIni akan memperbarui module dengan aman sesuai batasan (tanda ^ atau ~) di package.json._');
    } else {
        // ⚠️ GUARDRAIL: Validasi Anti Command Injection
        // Memastikan nama module hanya berisi huruf, angka, strip, @, titik, atau slash
        if (!/^[a-zA-Z0-9\-@/.]+$/.test(target)) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('❌ *Akses Ditolak:* Nama module mengandung karakter ilegal / tidak diizinkan!');
        }
        
        cmd = `npm install ${target}@latest`;
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        await m.reply(`⏳ _Memaksa pembaruan module *${target}* ke versi \`@latest\`...\nProses ini memerlukan koneksi internet server dan mungkin memakan waktu._`);
    }

    // Eksekusi perintah shell (NPM)
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal melakukan update:*\n\n\`\`\`${err.message}\`\`\``);
        }
        
        // Terkadang NPM menaruh output instalasi sukses di stderr, kita gabung keduanya
        let output = stdout.trim() || stderr.trim();
        
        // Memotong output jika terlalu panjang agar tidak kena limit karakter WhatsApp
        if (output.length > 2000) {
            output = output.substring(0, 2000) + '\n\n... (Output terpotong karena terlalu panjang)';
        }

        let replyText = `✅ *UPDATE SELESAI*\n`;
        replyText += `──────────────────\n`;
        replyText += `\`\`\`${output || 'Proses selesai tanpa log tambahan.'}\`\`\`\n`;
        replyText += `──────────────────\n`;
        replyText += `> 💡 _Sangat disarankan untuk merestart bot Anda (misal: .restart) agar perubahan module dapat dimuat sepenuhnya ke dalam memori._`;
        
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        m.reply(replyText);
    });
}

handler.help = ['updatemodule <nama/all>'];
handler.tags = ['owner'];
handler.command = /^(updatemodule|updatemodul|npmupdate)$/i;

// ⚠️ WAJIB HANYA UNTUK OWNER: Perintah exec sangat berisiko jika jatuh ke tangan user biasa
handler.owner = true;
handler.private = true;

module.exports = handler;