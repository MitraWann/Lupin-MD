/**
 * TULIPNEX GITHUB DATABASE SYNC
 * Fitur: Mengunggah database.json ke repositori GitHub secara otomatis.
 * Update: Penambahan fitur saklar (On/Off) secara dinamis dengan Persistent State.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// ================= CONFIGURATION =================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "TulipNex";
const REPO_NAME = "Dashboard";
const FILE_PATH = "database.json";
const SYNC_INTERVAL = 1 * 60 * 1000; // 3 Menit
// =================================================

async function syncToGithub() {
    const dbPath = path.join(process.cwd(), 'database.json');
    if (!fs.existsSync(dbPath)) throw new Error("File database.json tidak ditemukan.");

    // Membaca file langsung dari sistem (menghemat RAM daripada JSON.parse)
    const content = fs.readFileSync(dbPath, 'utf-8');
    const encodedContent = Buffer.from(content).toString('base64');

    let sha = "";
    try {
        const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const fileData = await getFile.json();
        sha = fileData.sha;
    } catch (e) {
        // Abaikan jika file belum ada (SHA kosong)
    }

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Bot Auto-Sync Database: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar' })}`,
            content: encodedContent,
            sha: sha || undefined
        })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal upload");
    console.log(`[GITHUB-SYNC] Database tersinkronisasi ke ${REPO_OWNER}/${REPO_NAME}`);
}

function startAutoSync() {
    // Bersihkan interval lama jika ada untuk mencegah double interval
    if (global.githubSyncInterval) {
        clearInterval(global.githubSyncInterval);
    }
    
    global.githubSyncInterval = setInterval(async () => {
        // Pastikan object global db ada
        let settings = global.db?.data?.settings || {};
        
        // Skip/Lewati proses sync jika saklar diatur ke off/false
        if (!settings.githubSync) return; 
        
        try {
            await syncToGithub();
        } catch (e) {
            console.error("[GITHUB-SYNC-ERROR]", e.message);
        }
    }, SYNC_INTERVAL);
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!isOwner) return;

    // Pastikan object settings ada di database agar tidak terjadi TypeError
    if (global.db && global.db.data && !global.db.data.settings) {
        global.db.data.settings = {};
    }

    let action = args[0] ? args[0].toLowerCase() : '';
    let settings = global.db.data.settings;

    // Jika pengguna mengetik .syncgithub on
    if (action === 'on') {
        if (settings.githubSync) return m.reply("⚠️ Auto-Sync sudah dalam keadaan *AKTIF*.");
        settings.githubSync = true;
        startAutoSync(); // Restart timer agar sinkronisasi pas 3 menit dari sekarang
        return m.reply("✅ *Auto-Sync GitHub telah DIAKTIFKAN.*\nDatabase akan disinkronisasi ke GitHub setiap 3 menit.");
    } 
    
    // Jika pengguna mengetik .syncgithub off
    if (action === 'off') {
        if (!settings.githubSync) return m.reply("⚠️ Auto-Sync sudah dalam keadaan *MATI*.");
        settings.githubSync = false;
        return m.reply("⛔ *Auto-Sync GitHub telah DIMATIKAN.*");
    }

    // Jika pengguna mengetik .syncgithub status
    if (action === 'status') {
        let status = settings.githubSync ? "🟢 *AKTIF*" : "🔴 *MATI*";
        let text = `📊 *STATUS GITHUB SYNC*\nStatus Auto-Sync: ${status}\n\n*PANDUAN PENGGUNAAN:*\n`;
        text += `> *${usedPrefix + command} on* (Menyalakan otomatisasi sync)\n`;
        text += `> *${usedPrefix + command} off* (Mematikan otomatisasi sync)\n`;
        text += `> *${usedPrefix + command}* (Memaksa sinkronisasi manual saat ini juga)`;
        return m.reply(text);
    }

    // Jika tanpa argumen, jalankan sinkronisasi paksa (Manual Override) sesuai desain UX asli
    await m.reply("🔄 Memulai sinkronisasi manual `database.json` ke GitHub...");
    try {
        await syncToGithub();
        m.reply("✅ Sinkronisasi manual selesai.");
    } catch (e) {
        m.reply(`❌ Gagal sinkronisasi: ${e.message}`);
    }
}

// Inisialisasi interval di latar belakang saat plugin diload
// Timer akan tetap berjalan, tetapi eksekusi API-nya akan dicegah jika setting 'githubSync' bernilai false.
if (!global.githubSyncInterval) {
    startAutoSync();
}

handler.help = ['syncgithub [on/off/status]'];
handler.tags = ['owner'];
handler.command = /^(syncgithub)$/i;
handler.owner = true;

module.exports = handler;