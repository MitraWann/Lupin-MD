/**
 * Plugin: Package & Module Dependency Mapper
 * Description: Memetakan semua module yang ada di package.json dan mencari di mana mereka digunakan.
 * Berguna untuk mendeteksi module usang yang bisa dihapus.
 */

const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, usedPrefix, command }) => {
    await m.reply(global.wait || '⏳ _Sedang memindai seluruh direktori dan memetakan module, mohon tunggu..._');

    try {
        const rootDir = process.cwd();
        const packageJsonPath = path.join(rootDir, 'package.json');

        // Memeriksa keberadaan package.json
        if (!fs.existsSync(packageJsonPath)) {
            return m.reply('❌ File `package.json` tidak ditemukan di root direktori bot!');
        }

        // Membaca isi package.json
        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = Object.keys(packageData.dependencies || {});

        if (dependencies.length === 0) {
            return m.reply('ℹ️ Tidak ada dependencies yang tercatat di package.json.');
        }

        // List folder/file yang akan diabaikan agar pemindaian lebih cepat dan akurat
        const ignoreList = ['node_modules', '.git', 'sessions', 'tmp', 'store', 'package.json', 'package-lock.json'];
        let allJsFiles = [];

        // Fungsi rekursif untuk mendapatkan semua file .js di dalam direktori bot
        const scanFiles = (dir) => {
            const files = fs.readdirSync(dir);
            for (let file of files) {
                const fullPath = path.join(dir, file);
                const relativePath = path.relative(rootDir, fullPath);

                // Cek apakah direktori atau file masuk dalam daftar abaikan
                if (ignoreList.some(ignored => relativePath.startsWith(ignored) || file === ignored)) continue;

                if (fs.statSync(fullPath).isDirectory()) {
                    scanFiles(fullPath);
                } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
                    allJsFiles.push(fullPath);
                }
            }
        };

        scanFiles(rootDir); // Mulai proses scanning

        // Menyiapkan map untuk menyimpan lokasi penggunaan tiap module
        let usageMap = {};
        dependencies.forEach(dep => usageMap[dep] = []);

        // Memindai setiap file JS untuk melihat pemanggilan module
        for (let file of allJsFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativeFilePath = path.relative(rootDir, file).replace(/\\/g, '/'); // Standardize path untuk Windows/Linux

            for (let dep of dependencies) {
                // Escape karakter spesial regex pada nama package (contoh: @adiwajshing/baileys)
                const escapeDep = dep.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                
                // Regex untuk menangkap require('package') atau require('package/sub') 
                // dan import 'package' atau import ... from 'package'
                const requireRegex = new RegExp(`require\\s*\\(\\s*['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]\\s*\\)`, 'g');
                const importRegex = new RegExp(`from\\s+['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]`, 'g');
                const directImportRegex = new RegExp(`import\\s+['"\`]${escapeDep}(?:/[^'"\`]*)?['"\`]`, 'g');

                // Jika module terpanggil dalam script file tsb
                if (requireRegex.test(content) || importRegex.test(content) || directImportRegex.test(content)) {
                    usageMap[dep].push(relativeFilePath);
                }
            }
        }

        // Menyusun pesan output
        let usedDepsText = '';
        let unusedDeps = [];

        for (let dep of dependencies) {
            if (usageMap[dep].length > 0) {
                usedDepsText += `📦 *${dep}*\n`;
                usageMap[dep].forEach(fileLoc => {
                    usedDepsText += `  └ 📄 ${fileLoc}\n`;
                });
                usedDepsText += `\n`;
            } else {
                unusedDeps.push(dep);
            }
        }

        let caption = `📊 *PACKAGE DEPENDENCY MAPPER*\n\n`;
        caption += `Total Module Terinstal: *${dependencies.length}*\n`;
        caption += `Total File Ter-scan: *${allJsFiles.length} file*\n`;
        caption += `──────────────────\n\n`;

        if (usedDepsText) {
            caption += `✅ *MODULE AKTIF & LOKASINYA:*\n\n${usedDepsText}`;
        }

        if (unusedDeps.length > 0) {
            caption += `──────────────────\n`;
            caption += `🗑️ *POTENSI UNUSED MODULE (BISA DIHAPUS):*\n\n`;
            unusedDeps.forEach(dep => {
                caption += `- \`${dep}\`\n`;
            });
            caption += `\n_Catatan: Modul di atas tidak terdeteksi melalui require/import standar. Pastikan modul tersebut tidak dipanggil secara dinamis (eval/exec) sebelum menghapusnya._\n`;
            caption += `> Cara hapus: \`npm uninstall <nama-module>\``;
        } else {
            caption += `\n_Semua module terdeteksi sedang digunakan!_`;
        }

        // Kirim hasil ke pengguna
        await m.reply(caption.trim());

    } catch (e) {
        console.error(e);
        m.reply(global.eror || '❌ Terjadi kesalahan saat memetakan module.');
    }
};

handler.help = ['scanmodule', 'pkgmap', 'checkpackage'];
handler.tags = ['owner'];
handler.command = /^(scanmodule|pkgmap|checkpackage|listmodule)$/i;

handler.owner = true; // Hanya owner yang boleh menggunakan untuk keamanan data arsitektur bot
handler.private = true;

module.exports = handler;