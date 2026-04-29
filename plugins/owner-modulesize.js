/**
 * Plugin: Module Size Monitor
 * Description: Menghitung dan memonitor ukuran direktori dari masing-masing module yang terinstal.
 * Berguna untuk mendeteksi module yang memakan banyak ruang disk/storage.
 */

const fs = require('fs');
const path = require('path');

// Helper untuk format ukuran bytes menjadi format yang mudah dibaca
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Fungsi rekursif asinkron untuk menghitung ukuran folder tanpa memblokir event loop bot
async function getFolderSize(dirPath) {
    let totalSize = 0;
    try {
        const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                totalSize += await getFolderSize(fullPath);
            } else if (file.isFile()) {
                const stats = await fs.promises.stat(fullPath);
                totalSize += stats.size;
            }
        }
    } catch (err) {
        // Abaikan jika folder/file tidak bisa diakses (misal: symlink error)
    }
    return totalSize;
}

let handler = async (m, { conn, usedPrefix, command }) => {
    await m.reply(global.wait || '⏳ _Sedang mengkalkulasi ukuran module di dalam node_modules, mohon tunggu beberapa saat..._');

    try {
        const rootDir = process.cwd();
        const packageJsonPath = path.join(rootDir, 'package.json');
        const nodeModulesPath = path.join(rootDir, 'node_modules');

        if (!fs.existsSync(packageJsonPath)) {
            return m.reply('❌ File `package.json` tidak ditemukan di root direktori!');
        }

        if (!fs.existsSync(nodeModulesPath)) {
            return m.reply('❌ Folder `node_modules` tidak ditemukan. Anda belum melakukan `npm install`?');
        }

        const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const dependencies = Object.keys(packageData.dependencies || {});

        if (dependencies.length === 0) {
            return m.reply('ℹ️ Tidak ada dependencies yang tercatat di package.json.');
        }

        let moduleSizes = [];
        let totalDependenciesSize = 0;

        // Loop untuk menghitung ukuran tiap module
        for (let dep of dependencies) {
            const depPath = path.join(nodeModulesPath, dep);
            if (fs.existsSync(depPath)) {
                const size = await getFolderSize(depPath);
                totalDependenciesSize += size;
                moduleSizes.push({
                    name: dep,
                    sizeBytes: size,
                    sizeFormatted: formatBytes(size)
                });
            } else {
                moduleSizes.push({
                    name: dep,
                    sizeBytes: 0,
                    sizeFormatted: 'Tidak ditemukan'
                });
            }
        }

        // Urutkan dari yang ukurannya paling besar (Descending)
        moduleSizes.sort((a, b) => b.sizeBytes - a.sizeBytes);

        // Menyusun output pesan
        let caption = `📊 *NODE_MODULES SIZE MONITOR*\n\n`;
        caption += `Total Module Terkalkulasi: *${dependencies.length}*\n`;
        caption += `Total Ukuran (Dependencies): *${formatBytes(totalDependenciesSize)}*\n`;
        caption += `──────────────────\n\n`;

        moduleSizes.forEach((mod, index) => {
            // Berikan highlight emoji peringatan jika ukurannya di atas 50MB
            let alertIcon = mod.sizeBytes > 52428800 ? '⚠️' : '📦';
            caption += `${alertIcon} *${mod.name}*\n`;
            caption += `  └ 💽 Ukuran: ${mod.sizeFormatted}\n\n`;
        });

        caption += `──────────────────\n`;
        caption += `_Catatan: Ukuran di atas adalah kalkulasi murni dari folder module utama. Total ukuran aktual node_modules mungkin lebih besar karena adanya sub-dependencies (hoisted modules)._`;

        await m.reply(caption.trim());

    } catch (e) {
        console.error(e);
        m.reply(global.eror || '❌ Terjadi kesalahan saat mengkalkulasi ukuran module.');
    }
};

handler.help = ['modulesize', 'pkgsize', 'checksize'];
handler.tags = ['owner'];
handler.command = /^(modulesize|pkgsize|checksize)$/i;

handler.owner = true; // Hanya dapat diakses oleh owner karena proses ini memakan resource CPU (I/O) singkat
handler.private = true;

module.exports = handler;