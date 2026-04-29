/**
 * PULL GITHUB REPOSITORY
 * Location: ./plugins/owner-gitpull.js
 * Feature: Download/Update SC Bot dari Github (Git Pull Wrapper)
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    let action = args[0]?.toLowerCase();

    if (!action) {
        let caption = `🔄 *G I T H U B - U P D A T E R* 🔄\n\n`;
        caption += `Tarik (Pull) update Source Code bot dari GitHub langsung ke server/lokal.\n\n`;
        caption += `*Daftar Perintah:*\n`;
        caption += `1. *${usedPrefix + command} pull*\n> Mengambil update terbaru dari GitHub secara aman (Safe Pull).\n`;
        caption += `2. *${usedPrefix + command} force*\n> Memaksa update dari GitHub (Mengabaikan & menghapus perubahan lokal yang belum di-commit jika terjadi konflik).\n`;
        return m.reply(caption);
    }

    try {
        if (action === 'pull') {
            m.reply(global.wait || '⏳ Sedang menarik pembaruan dari GitHub...');
            
            // Perintah git pull standar
            const { stdout, stderr } = await execPromise('git pull');
            
            let resultMsg = `✅ *PULL BERHASIL!*\n\n*Log:*\n${stdout}`;
            if (stderr && !stderr.includes('Already up to date')) {
                resultMsg += `\n*Info/Peringatan:*\n${stderr}`;
            }
            m.reply(resultMsg);
        } 
        
        else if (action === 'force') {
            m.reply(global.wait || '⏳ Memaksa pembaruan (Hard Reset)... File lokal yang bentrok akan ditimpa!');
            
            // Fetch semua data, buang perubahan lokal yang belum di-commit, lalu pull
            let gitCommand = `git fetch --all && git reset --hard HEAD && git pull`;
            const { stdout, stderr } = await execPromise(gitCommand);
            
            m.reply(`⚠️ *FORCE PULL SELESAI!*\n\n*Log:*\n${stdout}\n\n_Catatan: Bot sekarang sama persis dengan repository GitHub terbaru._`);
        }
        
        else {
            m.reply(`⚠️ Perintah tidak dikenali. Ketik *${usedPrefix + command}* untuk melihat panduan.`);
        }
        
    } catch (error) {
        let errStr = util.format(error);
        if (errStr.includes('fatal: not a git repository')) {
            m.reply(`❌ *ERROR:* Folder ini belum menjadi Git Repository.\nSilakan jalankan *${usedPrefix}github init* dan atur remote origin terlebih dahulu.`);
        } else if (errStr.includes('CONFLICT') || errStr.includes('Please commit your changes')) {
            m.reply(`❌ *TERJADI KONFLIK FILE!*\n\nAda file di bot yang Anda ubah secara manual dan bentrok dengan file dari GitHub.\n\n*Solusi:* Gunakan *${usedPrefix + command} force* untuk mengabaikan file lokal dan memaksa memakai file dari GitHub.`);
        } else {
            m.reply(`❌ *TERJADI KESALAHAN PADA SISTEM GIT:*\n\n${errStr.substring(0, 1500)}`);
        }
    }
};

handler.help = ['gitpull'];
handler.tags = ['owner'];
handler.command = /^(gitpull|gpull)$/i;
handler.rowner = true; // Sangat krusial: Hanya Real Owner yang bisa melakukan ini!

module.exports = handler;