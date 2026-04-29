/**
 * PLUGIN: Google Calendar Integrator
 * Fitur: Menambahkan jadwal langsung ke Google Calendar via App Script
 * Dibuat oleh: Senior WA Bot Developer
 */

const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // ⚠️ GANTI STRING DI BAWAH INI DENGAN URL WEB APP DARI GOOGLE APPS SCRIPT ANDA
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbwolEDy2McEskuUXATTm12EbnS6QgXh3t8VTasgRrKYLaVFiNICQSr4KzJeSMOBlCkE/exec'; 

    // Validasi Input Pengguna
    if (!text) {
        let usage = `*PENGGUNAAN SALAH!*\n\n`;
        usage += `Format:\n*${usedPrefix}${command} YYYY-MM-DD HH:MM | Nama Acara*\n\n`;
        usage += `Contoh:\n*${usedPrefix}${command} 2026-03-25 10:00 | Meeting dengan Klien*\n`;
        usage += `*${usedPrefix}${command} 2026-12-31 23:59 | Pesta Tahun Baru*`;
        return m.reply(usage);
    }

    // Memecah input menjadi Waktu dan Judul Acara
    let [timeInput, titleInput] = text.split('|');

    if (!timeInput || !titleInput) {
        return m.reply(`[!] Format salah. Jangan lupa gunakan pemisah tanda pipa ( | ).\nContoh: *${usedPrefix}${command} 2026-03-25 10:00 | Ujian Kelulusan*`);
    }

    // Membersihkan spasi berlebih
    timeInput = timeInput.trim();
    titleInput = titleInput.trim();

    // Mengirim pesan tunggu sesuai standar struktur base bot
    m.reply(global.wait || '⏳ Sedang memproses data ke Google Calendar...');

    try {
        // Mengirim HTTP POST ke Google Apps Script
        const response = await axios.post(GAS_URL, {
            time: timeInput,
            title: titleInput
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const resData = response.data;

        // Menangani response dari Apps Script
        if (resData.status) {
            let successMsg = `✅ *JADWAL BERHASIL DITAMBAHKAN*\n\n`;
            successMsg += `📝 *Acara:* ${titleInput}\n`;
            successMsg += `🕒 *Waktu:* ${timeInput}\n\n`;
            //successMsg += `Cek Google Calendar Anda untuk memastikannya.`;
            
            // Opsi tambahan: Menampilkan link event jika Apps Script berhasil men-generate
            //if (resData.eventLink) {
               //successMsg += `\n🔗 *Link Acara:* ${resData.eventLink}`;
            //}

            m.reply(successMsg);
        } else {
            // Jika ada error dari dalam GAS (misal format waktu tidak dikenali)
            m.reply(`❌ *Gagal menambahkan jadwal.*\n\nDetail Error dari Server:\n${resData.message}`);
        }

    } catch (e) {
        // Error handling yang diperbarui untuk mendeteksi masalah Deployment GAS
        console.error(e);
        let errMsg = `❌ *Terjadi kesalahan pada server.*\n\n`;
        
        if (e.response) {
            errMsg += `*Kode Error:* HTTP ${e.response.status}\n`;
            
            // Cek jika error terkait autentikasi / redirect login Google
            if (e.response.status === 401 || e.response.status === 403 || e.response.status === 302 || typeof e.response.data === 'string' && e.response.data.includes('Sign in')) {
                errMsg += `*Penyebab:* Google menolak akses bot.\n\n`;
                errMsg += `*SOLUSI (Wajib Dilakukan):*\n`;
                errMsg += `1. Buka Google Apps Script Anda.\n`;
                errMsg += `2. Klik *Terapkan (Deploy)* > *Kelola deployment*.\n`;
                errMsg += `3. Edit deployment Anda (ikon pensil).\n`;
                errMsg += `4. Ubah "Siapa yang memiliki akses" menjadi *"Siapa saja" (Anyone)*.\n`;
                errMsg += `5. Klik *Terapkan* dan gunakan URL yang baru.`;
            } else {
                errMsg += `*Detail:* ${e.message}`;
            }
        } else {
            errMsg += `*Pesan Error:* ${e.message}\n_Pastikan URL GAS sudah valid dan server merespon._`;
        }
        
        m.reply(errMsg);
    }
}

// Meta tag standard sesuai struktur file base
handler.help = ['addcal <tanggal | acara>'];
handler.tags = ['asisten'];
handler.command = /^(addcal|tambahjadwal|calendar|setjadwal)$/i;

// Opsi keamanan: Bisa diaktifkan jika hanya Owner/Premium yang boleh tambah jadwal
handler.owner = true; 
// handler.limit = true;

module.exports = handler;