/**
 * TULIPNEX EVENT FREQUENCY CHECKER
 * Location: ./plugins/trading-cekevent.js
 * Feature: Mengetahui seberapa sering event muncul secara statistik.
 */

let handler = async (m, { conn }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    
    // Sinkronisasi dengan trading-announcer.js: Default adalah 5% (0.05) jika belum di-set
    let chance = market.eventChance !== undefined ? market.eventChance : 5; 
    
    let caption = `📊 *STATISTIK CUACA PASAR TULIPNEX*\n`;
    caption += `──────────────────\n`;
    
    if (chance <= 0) {
        caption += `☁️ *Kondisi:* Sangat Tenang (Stabil)\n`;
        caption += `⚠️ *Event Otomatis:* MATI (0%)\n\n`;
        caption += `_Pasar saat ini kebal dari badai ekonomi otomatis, kecuali diintervensi langsung oleh Dewan Direksi / Owner._`;
    } else {
        // Menghitung berapa menit yang dibutuhkan untuk 1 event secara matematis.
        // Berdasarkan engine, 1 putaran = 1 pergantian menit WITA.
        let freqCalc = Math.round(100 / chance);
        
        let condition = chance < 5 ? 'Relatif Tenang' 
                      : chance < 15 ? 'Normal / Fluktuatif' 
                      : chance < 30 ? 'Rawan Badai' 
                      : 'Kiamat Ekonomi (Sangat Ekstrem)';
                      
        caption += `🌪️ *Kondisi:* ${condition}\n`;
        caption += `🎲 *Peluang Event:* ${chance}% per menit.\n\n`;
        caption += `⏱️ *Estimasi Frekuensi:*\n`;
        caption += `Secara statistik, *1 buah Event* (seperti Crash, Hack, atau Boom) diperkirakan akan muncul *setiap ~${freqCalc} menit*.\n\n`;
        caption += `_Catatan: Event dikocok setiap kali waktu WITA berganti menit. Estimasi ini adalah rata-rata probabilitas matematis._\n`;
    }
    
    // --- NEW: TAMPILAN STATISTIK 1 JAM TERAKHIR ---
    market.eventHistory = market.eventHistory || [];
    let oneHourAgo = Date.now() - 3600000;
    
    // Filter ulang untuk memastikan hanya data 1 jam terakhir yang dihitung
    let recentEvents = market.eventHistory.filter(e => e.time >= oneHourAgo);
    let eventCount = recentEvents.length;
    
    caption += `\n📈 *REKAP HISTORI (1 JAM TERAKHIR)*\n`;
    caption += `Total Event Terjadi: *${eventCount} kali*\n`;
    
    if (eventCount > 0) {
        caption += `_Riwayat Terbaru:_ \n`;
        // Menampilkan maksimal 5 event terbaru saja agar tidak spam chat
        let displayList = recentEvents.slice(-5).reverse();
        displayList.forEach((ev) => {
            let timeStr = new Date(ev.time).toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' });
            caption += `• [${timeStr} WITA] ${ev.title}\n`;
        });
        
        if (eventCount > 5) {
            caption += `_...dan ${eventCount - 5} event lainnya._\n`;
        }
    } else {
        caption += `_Pasar terpantau sangat tenang tanpa gangguan._\n`;
    }
    
    caption += `\n──────────────────`;
    
    return m.reply(caption);
}

handler.help = ['cekevent', 'frekuensievent'];
handler.tags = ['god']; // Sesuai dengan kategori menu terbaru
handler.command = /^(cekevent|cekevents|frekuensievent|eventfreq)$/i;
handler.owner = true;
handler.private = true;

module.exports = handler;