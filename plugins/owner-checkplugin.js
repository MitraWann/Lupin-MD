/**
 * Nama Plugin: Plugin Error Detector
 * Deskripsi: Memindai semua plugin di folder plugins/ untuk mencari Syntax Error 
 * maupun Runtime Error dan menampilkannya di WhatsApp.
 * Author: Senior WA Bot Developer
 */

const fs = require('fs');
const path = require('path');
const syntaxError = require('syntax-error');
const util = require('util');

let handler = async (m, { conn, usedPrefix, command }) => {
    await m.reply(global.wait || '⏳ _Memindai seluruh sistem plugin, mohon tunggu..._');
    
    let pluginsDir = path.join(process.cwd(), 'plugins');
    
    // Membaca semua file berakhiran .js di folder plugins
    let files = fs.readdirSync(pluginsDir).filter(v => v.endsWith('.js'));
    let errorList = [];
    
    for (let file of files) {
        let filePath = path.join(pluginsDir, file);
        try {
            // 1. Cek Syntax Error terlebih dahulu (Kurang koma, tutup kurawal, dll)
            let code = fs.readFileSync(filePath, 'utf8');
            let err = syntaxError(code, file);
            
            if (err) {
                errorList.push({
                    file: file,
                    type: 'Syntax Error',
                    // Mengambil detail error dari modul syntax-error
                    msg: err.toString() 
                });
                continue; // Skip pengecekan require jika syntax sudah hancur
            }
            
            // 2. Cek Runtime/Import Error (Modul tidak ditemukan, undefined variable di global scope)
            // Hapus cache agar engine benar-benar melakukan kompilasi ulang saat require
            if (require.cache[require.resolve(filePath)]) {
                delete require.cache[require.resolve(filePath)];
            }
            require(filePath);
            
        } catch (e) {
            // Menangkap error saat require dijalankan
            errorList.push({
                file: file,
                type: 'Runtime/Import Error',
                msg: e.message || util.format(e)
            });
        }
    }
    
    // --- HASIL SCAN ---
    if (errorList.length === 0) {
        return m.reply('✅ *STATUS: AMAN*\n\nTidak ditemukan error pada semua plugin. Seluruh sistem berjalan dengan baik!');
    }
    
    let report = `🚨 *TERDETEKSI ${errorList.length} PLUGIN ERROR* 🚨\n\n`;
    
    errorList.forEach((err, index) => {
        report += `*${index + 1}. ${err.file}*\n`;
        report += `> *Tipe:* ${err.type}\n`;
        
        // Membersihkan output agar tidak terlalu panjang/spam (ambil max 3 baris pertama)
        let cleanMsg = err.msg.split('\n').slice(0, 3).join('\n> '); 
        report += `> *Detail:*\n> ${cleanMsg}\n\n`;
    });
    
    report += `💡 _Segera perbaiki file di atas. Gunakan \`console.log\` di terminal untuk investigasi lebih lanjut._`;
    
    m.reply(report);
}

// Metadata Plugin
handler.help = ['checkplugin', 'pluginerror'];
handler.tags = ['owner'];
handler.command = /^(checkplugin|pluginerror|cekplugin|errplugin)$/i;

// KEAMANAN: Akses hanya untuk Owner
handler.owner = true; 

module.exports = handler;