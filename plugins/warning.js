const { EventEmitter } = require('events');

/**
 * Plugin: Trace MaxListeners Warning & Manual Checker
 * Deskripsi: Melacak baris kode penyebab penumpukan listener & cek status secara manual.
 * Author: Senior WhatsApp Bot Developer
 */

let handler = async (m, { conn, isOwner, command }) => {
    if (!isOwner) return;

    if (command === 'checkleak') {
        // Mengambil daftar listener dari object koneksi utama (Baileys)
        const events = conn.ev._events; 
        if (!events) return m.reply('❌ Tidak dapat menemukan event emitter pada koneksi.');

        let report = `📊 *LISTENER STATUS (CURRENT)*\n\n`;
        let highAlert = false;

        for (let eventName in events) {
            const count = conn.listenerCount(eventName);
            const max = conn.getMaxListeners();
            const status = count > (max - 2) ? '⚠️' : '✅';
            if (count > (max - 2)) highAlert = true;
            
            report += `${status} *Event:* \`${eventName}\`\n`;
            report += `   ⤷ Count: ${count} / Max: ${max}\n\n`;
        }

        report += `_Gunakan *.tracewarning* untuk memantau Stack Trace otomatis di terminal._`;
        if (highAlert) report += `\n\n📢 *Peringatan:* Ada event yang hampir melewati batas! Cek terminal sekarang.`;
        
        return m.reply(report);
    }

    m.reply('🔍 [SYSTEM] Debugger pencari kebocoran listener aktif.\n\n' +
            '1. *Otomatis:* Jika terjadi leak, Stack Trace akan muncul di terminal.\n' +
            '2. *Manual:* Ketik *.checkleak* untuk melihat statistik saat ini.');
}

handler.help = ['tracewarning', 'checkleak']
handler.tags = ['owner', 'system']
handler.command = /^(tracewarning|checkleak)$/i
handler.owner = true

// --- LOGIKA DEBUGGER (MONKEY-PATCHING) ---

const originalAddListener = EventEmitter.prototype.addListener;
const originalOn = EventEmitter.prototype.on;

let isIntercepting = false;

function setupInterceptor() {
    if (isIntercepting) return;
    isIntercepting = true;

    const wrapper = function (type, listener) {
        const result = originalAddListener.apply(this, arguments);
        const count = this.listenerCount(type);
        const max = this.getMaxListeners() || 10;

        if (count > max) {
            console.warn(`\n\x1b[41m\x1b[37m [MEMORY-LEAK DETECTED] \x1b[0m`);
            console.warn(`\x1b[33mEvent Name :\x1b[0m ${type}`);
            console.warn(`\x1b[33mTotal Count:\x1b[0m ${count} (Batas Max: ${max})`);
            console.warn(`\x1b[36mStack Trace (Cari file plugin Anda di bawah ini):\x1b[0m`);
            
            const stack = new Error().stack;
            const cleanedStack = stack.split('\n').slice(2).filter(line => !line.includes('node:internal')).join('\n');
            console.log(cleanedStack);
            console.log(`\x1b[31m-------------------------------------------\x1b[0m\n`);
        }
        return result;
    };

    EventEmitter.prototype.addListener = wrapper;
    EventEmitter.prototype.on = wrapper;
}

// Menangani peringatan global
process.on('warning', (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        console.error('\x1b[41m\x1b[37m [NODE-SYSTEM WARNING] \x1b[0m');
        console.error(`\x1b[31m${warning.message}\x1b[0m`);
        console.error(warning.stack);
    }
});

setupInterceptor();

module.exports = handler;