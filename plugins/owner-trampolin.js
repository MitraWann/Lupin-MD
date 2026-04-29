const os = require('os');
const { performance } = require('perf_hooks');

// Helper untuk format ukuran RAM/Memory
const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper untuk format durasi (uptime)
const clockString = (ms) => {
    let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [d, ' Hari ', h, ' Jam ', m, ' Menit ', s, ' Detik'].map(v => v.toString().padStart(2, 0)).join('');
};

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Kirim pesan loading agar tahu bot merespon
        if (global.wait) await m.reply(global.wait);

        // Menghitung latensi/kecepatan respon
        const old = performance.now();
        const neww = performance.now();
        const speed = (neww - old).toFixed(4);

        // Mengambil data memori Node.js (V8)
        const mem = process.memoryUsage();
        
        // Memeriksa status koneksi socket Baileys (jika tersedia)
        // Di Baileys, ws bisa berada di conn.ws atau conn.socket
        const socketStatus = (conn.ws && conn.ws.readyState === 1) ? '✅ Terhubung (Open)' : '⚠️ Berisiko/Tertutup';

        let txt = `*💻 SYSTEM MONITORING*
*${botname} Server Status*

*⏱️ Uptime Bot:* ${clockString(process.uptime() * 1000)}
*⏱️ Uptime Server:* ${clockString(os.uptime() * 1000)}
*🚀 Latensi (Ping):* ${speed} ms
*📡 Socket WA:* ${socketStatus}

*📊 Node.js Memory (Proses Bot):*
- RSS (Total RAM dipakai): *${formatSize(mem.rss)}*
- Heap Total: *${formatSize(mem.heapTotal)}*
- Heap Used: *${formatSize(mem.heapUsed)}*
- External: *${formatSize(mem.external)}*

*🖥️ Server (Pterodactyl Container):*
- CPU Core: ${os.cpus().length} Core
- Total RAM: *${formatSize(os.totalmem())}*
- Sisa RAM: *${formatSize(os.freemem())}*
- Platform: ${os.platform()}

> _Jika *Heap Used* terus naik drastis atau sisa RAM server menipis, bot rawan terkena Force Close (Socket Ended)._`;

        await m.reply(txt);
        
    } catch (e) {
        console.error(e);
        m.reply(global.eror || 'Terjadi kesalahan saat memonitor sistem.');
    }
}

handler.help = ['trampolin'];
handler.tags = ['owner', 'info'];
handler.command = /^(trampolin)$/i;

// Disarankan hanya untuk owner agar tidak dispam user (yang bisa menyebabkan rate-limit juga)
handler.owner = true; 

module.exports = handler;