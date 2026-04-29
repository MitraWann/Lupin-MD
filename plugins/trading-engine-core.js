/**
 * TULIPNEX TRADING ENGINE CORE (MULTI-GROUP BROADCAST)
 * Location: ./plugins/trading-engine-core.js
 * Feature: Price movements, Events, Broadcast, Cooldown System, and .forceevent trigger
 * Update: Added Event Cooldown to prevent back-to-back events
 */

const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone'); 

const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

let handler = async (m, { conn, command }) => {
    let action = (command || '').toLowerCase();
    let market = global.db.data?.settings?.trading;
    
    if (!market) {
        return m.reply(`⚠️ *Peringatan:* Database market belum terbentuk. Tunggu mesin memproses data di menit berikutnya.`);
    }

    let activeChatsCount = Object.values(global.db.data.chats || {}).filter(chat => chat.tradingNews).length;

    // ==========================================
    // COMMAND: .enginestatus
    // ==========================================
    if (action === 'enginestatus') {
        let status = global.tradingInterval ? "🟢 AKTIF & BERJALAN" : "🔴 MATI / ERROR";
        let announcerStatus = activeChatsCount > 0 ? `📡 Aktif di ${activeChatsCount} Grup` : `🔇 Dimatikan (Tidak ada grup)`;
        let lastSync = market.lastMinuteMarker || "Belum ada sinkronisasi";

        let eventText = "Normal (Tidak ada event)";
        if (market.activeEvent && market.activeEvent.title !== 'STABLE') {
            eventText = String.fromCharCode(9888) + ' ' + market.activeEvent.title + ' (' + market.activeEvent.ticker + ') - Sisa: ' + market.activeEvent.dur + 'm';
        }

        // Status Cooldown
        let cooldownStatus = (market.eventCooldown && market.eventCooldown > 0) 
            ? `⏳ Pendinginan: ${market.eventCooldown} Menit tersisa` 
            : `✅ Siap memicu event baru`;

        let canceledText = "-";
        if (market.lastCanceledEvent) {
            let age = Date.now() - market.lastCanceledEvent.time;
            if (age < 3600000) {
                canceledText = `${market.lastCanceledEvent.title}\n> ❌ *Alasan:* ${market.lastCanceledEvent.reason}`;
            } else {
                market.lastCanceledEvent = null;
            }
        }

        let vaultBalance = (market.vault || 0).toLocaleString('id-ID');

        let pricesText = "";
        if (market.prices) {
            for (let t in market.prices) {
                let current = market.prices[t];
                let prev = (market.prevPrices && market.prevPrices[t]) ? market.prevPrices[t] : current;
                let diff = current - prev;
                let emoji = diff > 0 ? '📈' : (diff < 0 ? '📉' : '➖');
                let prob = (market.probabilities && market.probabilities[t]) ? market.probabilities[t] : "50%";
                pricesText += `${t}: Rp ${current.toLocaleString('id-ID')} ${emoji} \n> (Probabilitas Naik: ${prob})\n`;
            }
        } else {
            pricesText = "│ _Belum ada data harga_\n";
        }

        let caption = `⚙️ *SYSTEM MONITOR: TULIPNEX ENGINE*\n`;
        caption += `──────────────────\n`;
        caption += `🔌 *Status Mesin:* \n> ${status}\n`;
        caption += `⏱️ *Last Sync (WITA):* \n> ${lastSync}\n`;
        caption += `📢 *News Broadcast:* \n> ${announcerStatus}\n`;
        caption += `──────────────────\n`;
        caption += `🎲 *Sistem RNG & Frekuensi Event:*\n`;
        caption += `> Peluang Trigger: *0.55% setiap menit*\n`;
        caption += `> Syarat Event: Pasar harus *STABLE*\n`;
        caption += `> Jeda Antar Event: *120 Menit (Cooldown)*\n`;
        caption += `> Status RNG: *${cooldownStatus}*\n`;
        caption += `──────────────────\n`;
        caption += `🌍 *Active Event (RNG):*\n> ${eventText}\n`;
        caption += `🛡️ *Event Dibatalkan (Filter):*\n> ${canceledText}\n`;
        caption += `💰 *Brankas (Vault):*\n> Rp ${vaultBalance}\n`;
        caption += `──────────────────\n`;
        caption += `📊 *Live Prices & Probability:*\n${pricesText}`;
        caption += `──────────────────\n`;
        caption += `_Engine otomatis memproses fluktuasi harga & rubber-band setiap pergantian menit._`;

        return m.reply(caption);
    }

    // ==========================================
    // COMMAND: .forceevent (Uji Coba & Trigger Manual)
    // ==========================================
    if (action === 'forceevent') {
        if (!eventPool || eventPool.length === 0) return m.reply(`[!] Tidak ada data event di lib/trading-events.js`);
        if (activeChatsCount === 0) return m.reply(`[!] Percuma melakukan broadcast, belum ada grup yang mengaktifkan .setnews`);

        // Pilih event secara acak (Abaikan filter untuk paksaan testing)
        let rawEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
        
        market.activeEvent = { ...rawEvent };
        market.eventHistory.push({ title: rawEvent.title, time: Date.now() });
        market.eventCooldown = 120; // Set cooldown secara paksa setelah force event
        
        let news = `📢 *TULIPNEX NEWS FLASH (FORCED)*\n──────────────────\n📰 *Event:* ${rawEvent.title}\n💬 ${rawEvent.msg}\n🎯 *Impact:* ${rawEvent.ticker}\n⏳ *Durasi:* ${rawEvent.dur} Menit\n──────────────────`;

        let activeGroupJids = Object.entries(global.db.data.chats)
            .filter(([jid, chat]) => chat.tradingNews)
            .map(([jid]) => jid);

        m.reply(`✅ *MANUAL OVERRIDE BERHASIL*\nEvent *${rawEvent.title}* dipicu secara paksa!\nSedang menyiarkan berita ke *${activeChatsCount}* grup secara perlahan...\n\n_Catatan: Cooldown 120 menit telah diaktifkan setelah event ini selesai._`);

        const broadcastNews = async () => {
            for (let jid of activeGroupJids) {
                try {
                    await conn.reply(jid, news, null);
                    await delay(500); // Jeda anti-spam
                } catch (err) {
                    console.error(`[TulipNex] Gagal mengirim test event ke grup ${jid}:`, err);
                }
            }
        };
        
        broadcastNews();
    }
}

// OTAM MESIN: Berjalan otomatis di latar belakang saat plugin di-load
if (!global.tradingInterval) {
    console.log('🚀 [TulipNex] Engine Core Started (Multi-Group Broadcast Mode)...');
    
    global.tradingInterval = setInterval(async () => {
        try {
            let market = global.db.data?.settings?.trading;
            if (!market || !global.conn) return;

            let nowTz = moment().tz('Asia/Makassar');
            let currentMinuteMarker = nowTz.format('YYYY-MM-DD HH:mm');

            if (market.lastMinuteMarker !== currentMinuteMarker) {
                const config = {
                    IVL: { min: 3000, max: 99999, vol: 0.03 },
                    LBT: { min: 100000, max: 999999, vol: 0.05 },
                    IRC: { min: 1000000, max: 9999999, vol: 0.05 },
                    LTN: { min: 10000000, max: 99999999, vol: 0.05 },
                    RSX: { min: 100000000, max: 999999999, vol: 0.05 },
                    TNX: { min: 1000000000, max: 10000000000, vol: 0.05 }
                };

                market.prices = market.prices || {};
                market.history = market.history || {};
                market.ath = market.ath || {};
                market.eventHistory = market.eventHistory || []; 
                market.eventCooldown = market.eventCooldown || 0; // Inisialisasi Cooldown
                
                // Set initial prices to the middle of the range if they don't exist
                for (let k in config) {
                    if (!market.prices[k]) {
                        market.prices[k] = Math.floor((config[k].min + config[k].max) / 2);
                    }
                }

                let news = "";
                let minutesPassed = 1; 
                if (market.lastMinuteMarker) {
                    let lastTz = moment.tz(market.lastMinuteMarker, 'YYYY-MM-DD HH:mm', 'Asia/Makassar');
                    minutesPassed = Math.max(1, nowTz.diff(lastTz, 'minutes'));
                }

                market.activeEvent = market.activeEvent || { title: 'STABLE', dur: 0 };
                
                // Kurangi durasi event aktif ATAU kurangi masa cooldown jika pasar STABLE
                if (market.activeEvent.dur > 0) {
                    market.activeEvent.dur -= minutesPassed;
                } else {
                    market.activeEvent = { title: 'STABLE', msg: 'Normal', ticker: null, mult: 1, dur: 0 };
                    
                    // Kurangi cooldown hanya jika pasar sedang tidak ada event (STABLE)
                    if (market.eventCooldown > 0) {
                        market.eventCooldown = Math.max(0, market.eventCooldown - minutesPassed);
                    }
                }

                // RNG Trigger - Sekarang ditambahkan syarat Cooldown harus 0 (Selesai)
                if (market.activeEvent.title === 'STABLE' && market.eventCooldown <= 0 && Math.random() < 0.0055) {
                    if (eventPool.length > 0) {
                        let rawEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
                        let isValid = true;
                        let rejectReason = "";

                        if (rawEvent.ticker === 'GLOBAL') {
                            let hancurCount = 0; let pucukCount = 0;
                            for (let t in config) {
                                let range = config[t].max - config[t].min;
                                if (market.prices[t] <= config[t].min + (range * 0.25)) hancurCount++;
                                if (market.prices[t] >= config[t].max - (range * 0.25)) pucukCount++;
                            }
                            if (rawEvent.mult < 0 && hancurCount >= 3) { isValid = false; rejectReason = "Krisis ditolak (Mayoritas Koin sedang Hancur/Di Dasar)"; }
                            if (rawEvent.mult > 0 && pucukCount >= 3) { isValid = false; rejectReason = "Bubble ditolak (Mayoritas Koin sudah Terlalu Mahal)"; }
                        } else {
                            let c = config[rawEvent.ticker];
                            let p = market.prices[rawEvent.ticker];
                            let range = c.max - c.min;
                            let isNearMin = p <= (c.min + range * 0.25); 
                            let isNearMax = p >= (c.max - range * 0.25); 

                            if (rawEvent.mult < 0 && isNearMin) { isValid = false; rejectReason = `Bearish ditolak (${rawEvent.ticker} sudah menyentuh Support/Dasar)`; }
                            if (rawEvent.mult > 0 && isNearMax) { isValid = false; rejectReason = `Bullish ditolak (${rawEvent.ticker} sudah menyentuh Resisten/Pucuk)`; }
                        }

                        if (isValid) {
                            market.activeEvent = { ...rawEvent };
                            market.lastCanceledEvent = null; 
                            market.eventHistory.push({ title: rawEvent.title, time: Date.now() });
                            
                            // SET COOLDOWN SETELAH EVENT DIPILIH
                            // Event berikutnya tidak akan bisa terjadi setidaknya selama 120 Menit (2 Jam) setelah event ini SELESAI
                            market.eventCooldown = 120; 

                            news = `📢 *TULIPNEX NEWS FLASH*\n──────────────────\n📰 *Event:* ${rawEvent.title}\n💬 ${rawEvent.msg}\n🎯 *Impact:* ${rawEvent.ticker}\n⏳ *Durasi:* ${rawEvent.dur} Menit\n──────────────────`;
                        } else {
                            market.lastCanceledEvent = { title: rawEvent.title, reason: rejectReason, time: Date.now() };
                        }
                    }
                }

                let oneHourAgo = Date.now() - 3600000;
                market.eventHistory = market.eventHistory.filter(e => e.time >= oneHourAgo);

                market.prevPrices = { ...market.prices };
                market.probabilities = market.probabilities || {}; 
                
                for (let t in config) {
                    let c = config[t];
                    let currentPrice = market.prices[t];
                    let range = c.max - c.min;

                    let upChance = (market.activeEvent.ticker === 'GLOBAL' || market.activeEvent.ticker === t) ? (market.activeEvent.mult > 0 ? 0.8 : 0.2) : 0.5;
                    let nearMinThreshold = c.min + (range * 0.10);
                    let nearMaxThreshold = c.max - (range * 0.10);

                    if (currentPrice <= nearMinThreshold) upChance = Math.max(upChance, 0.95); 
                    else if (currentPrice >= nearMaxThreshold) upChance = Math.min(upChance, 0.05); 

                    market.probabilities[t] = (upChance * 100).toFixed(0) + '%';
                    
                    // Arithmetic Random Walk untuk mencegah Volatility Drag
                    let nominalFluctuation = range * (c.vol * 0.5); 
                    let changeNominal = Math.random() * nominalFluctuation;
                    let direction = Math.random() < upChance ? 1 : -1;
                    
                    let newPrice = Math.round(currentPrice + (changeNominal * direction));

                    let padding = Math.floor(range * 0.015);
                    market.prices[t] = Math.max(c.min + padding, Math.min(c.max - padding, newPrice));

                    if (!market.history[t]) market.history[t] = [];
                    market.history[t].push(market.prices[t]);
                    if (market.history[t].length > 10) market.history[t].shift();
                    if (!market.ath[t]) market.ath[t] = market.prices[t];
                    if (market.prices[t] > market.ath[t]) market.ath[t] = market.prices[t];
                }

                market.lastMinuteMarker = currentMinuteMarker;
                market.lastUpdate = Date.now(); 

                if (news) {
                    let activeGroupJids = Object.entries(global.db.data.chats)
                        .filter(([jid, chat]) => chat.tradingNews)
                        .map(([jid]) => jid);

                    const broadcastNews = async () => {
                        for (let jid of activeGroupJids) {
                            try {
                                await global.conn.reply(jid, news, null);
                                await delay(500);
                            } catch (err) {}
                        }
                    };
                    broadcastNews();
                }
            }
        } catch (e) {
            console.error('❌ [TulipNex] Engine Core Error:', e);
        }
    }, 5000); 
}

handler.help = ['enginestatus', 'forceevent'];
handler.tags = ['god'];
handler.command = /^(enginestatus|forceevent)$/i;
handler.owner = true;
handler.private = true;

module.exports = handler;