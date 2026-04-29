/**
 * Plugin: NPM Module Uninstaller (Interactive Auto-Detect)
 * Description: Mendeteksi module tidak terpakai lalu memunculkan opsi interaktif (reply angka atau 'all')
 * untuk menghapus module secara aman. Tetap mendukung penghapusan langsung.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // Siapkan memori sesi untuk menyimpan daftar module per user
    conn.uninstallSessions = conn.uninstallSessions || {};

    // ==========================================
    // MODE 1: PENGHAPUSAN LANGSUNG (DIRECT UNINSTALL)
    // Jika owner langsung mengetikkan nama module (Contoh: .delmodule moment)
    // ==========================================
    if (args[0]) {
        let target = args[0].toLowerCase();

        // ⚠️ GUARDRAIL: Validasi Anti Command Injection
        if (!/^[a-zA-Z0-9\-@/.]+$/.test(target)) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('❌ *Akses Ditolak:* Nama module mengandung karakter ilegal!');
        }

        return executeUninstall(m, conn, [target]); // Gunakan array agar kompatibel dengan exec
    }

    // ==========================================
    // MODE 2: AUTO-DETECT MODULE TAK TERPAKAI
    // ==========================================
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    await m.reply(global.wait || '🔍 _Radar diaktifkan! Sedang memindai seluruh direktori untuk mendeteksi module yang tidak terpakai..._');

    const rootDir = process.cwd();
    const packageJsonPath = path.join(rootDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) return m.reply('❌ `package.json` tidak ditemukan!');
    
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = Object.keys(packageData.dependencies || {});
    
    if (dependencies.length === 0) return m.reply('ℹ️ Tidak ada module terinstal di `package.json`.');

    // Folder yang diabaikan agar bot tidak crash
    const ignoreList = ['node_modules', '.git', 'sessions', 'tmp', 'store', 'package.json', 'package-lock.json'];
    let allJsFiles = [];

    // Fungsi scan folder rekursif
    const scanFiles = (dir) => {
        try {
            const files = fs.readdirSync(dir);
            for (let file of files) {
                const fullPath = path.join(dir, file);
                const relativePath = path.relative(rootDir, fullPath);
                
                if (ignoreList.some(ignored => relativePath.startsWith(ignored) || file === ignored)) continue;
                
                if (fs.statSync(fullPath).isDirectory()) {
                    scanFiles(fullPath);
                } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
                    allJsFiles.push(fullPath);
                }
            }
        } catch (e) {}
    };
    
    scanFiles(rootDir);

    let usageMap = {};
    dependencies.forEach(dep => usageMap[dep] = 0);

    // Baca setiap file dan gunakan regex untuk mencari require() atau import
    for (let file of allJsFiles) {
        try {
            const content = fs.readFileSync(file, 'utf-8');
            for (let dep of dependencies) {
                const escapeDep = dep.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                const requireRegex = new RegExp(`require\\s*\\(\\s*['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]\\s*\\)`, 'g');
                const importRegex = new RegExp(`from\\s+['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]`, 'g');
                const directImportRegex = new RegExp(`import\\s+['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]`, 'g');
                
                if (requireRegex.test(content) || importRegex.test(content) || directImportRegex.test(content)) {
                    usageMap[dep]++;
                }
            }
        } catch(e) {} // Abaikan jika gagal baca file
    }

    // Filter hanya module yang tidak memiliki match (0 penggunaan)
    let unusedDeps = dependencies.filter(dep => usageMap[dep] === 0);

    if (unusedDeps.length === 0) {
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        return m.reply('✨ _Luar biasa! Semua module yang terinstal sedang aktif digunakan._');
    }

    // Simpan daftar unused module ke dalam sesi agar bisa direply
    conn.uninstallSessions[m.sender] = unusedDeps;

    // Susun pesan interaktif
    let txt = `🗑️ *UNUSED MODULES DETECTED*\n\n`;
    txt += `Ditemukan *${unusedDeps.length}* module yang berpotensi tidak dipanggil di kode mana pun:\n\n`;
    
    unusedDeps.forEach((dep, i) => {
        txt += `*${i + 1}.* \`${dep}\`\n`;
    });
    
    txt += `\n──────────────────\n`;
    txt += `*Cara Menghapus:*\n`;
    txt += `Balas (reply) pesan ini dengan:\n`;
    txt += `> Nomor module (contoh: *1* atau *3*)\n`;
    txt += `> Kata *all* untuk meratakan/menghapus semuanya sekaligus\n`;

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    m.reply(txt);
};

// ==========================================
// LISTENER BALASAN (INTERACTIVE REPLY HANDLER)
// ==========================================
handler.before = async function (m, { conn }) {
    conn.uninstallSessions = conn.uninstallSessions || {};
    let session = conn.uninstallSessions[m.sender];
    
    // Pastikan ini adalah balasan ke pesan bot kita dan user memiliki sesi aktif
    if (!m.quoted || !m.quoted.fromMe || !m.text || !session) return;
    if (!m.quoted.text.includes('UNUSED MODULES DETECTED')) return;

    let text = m.text.trim().toLowerCase();
    let targetModules = [];

    // Tentukan module yang akan dihapus berdasarkan input user
    if (text === 'all') {
        targetModules = session; // Hapus semuanya
    } else if (!isNaN(text)) {
        let index = parseInt(text) - 1; // Ubah ke format index array
        if (index >= 0 && index < session.length) {
            targetModules = [session[index]]; // Hapus module sesuai nomor
        } else {
            return m.reply('❌ Nomor urut yang Anda masukkan tidak ada di dalam daftar.');
        }
    } else {
        return; // Abaikan jika balasan bukan angka / bukan 'all'
    }

    // Bersihkan memori sesi agar tidak tertumpuk
    delete conn.uninstallSessions[m.sender]; 

    // Eksekusi terminal
    executeUninstall(m, conn, targetModules);
};

// ==========================================
// HELPER: CORE UNINSTALL ENGINE
// ==========================================
function executeUninstall(m, conn, targetArray) {
    let targetString = targetArray.join(' '); // Gabungkan array jadi string, cth: "moment cheerio axios"
    
    conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    m.reply(`⏳ _Mengeksekusi perintah penghapusan untuk:_\n*${targetArray.join(', ')}*`);

    exec(`npm uninstall ${targetString}`, (err, stdout, stderr) => {
        if (err) {
            conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal melakukan uninstall:*\n\n\`\`\`${err.message}\`\`\``);
        }
        
        let output = stdout.trim() || stderr.trim();
        // Batasi karakter agar tidak kena WhatsApp Limit
        if (output.length > 2000) output = output.substring(0, 2000) + '\n\n... (Output terpotong)';

        let replyText = `✅ *UNINSTALL SELESAI*\n`;
        replyText += `──────────────────\n`;
        replyText += `\`\`\`${output || 'Proses selesai tanpa log tambahan.'}\`\`\`\n`;
        replyText += `──────────────────\n`;
        replyText += `> 💡 _Berhasil membersihkan ${targetArray.length} module dari server._`;
        
        conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        m.reply(replyText);
    });
}

handler.help = ['delmodule <nama/all>'];
handler.tags = ['owner'];
handler.command = /^(uninstallmodule|delmodule|rmmodule|hapusmodule)$/i;

// Guardrail keamanan utama
handler.owner = true;
handler.private = true;

module.exports = handler;