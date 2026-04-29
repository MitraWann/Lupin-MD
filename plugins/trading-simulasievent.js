/**
 * TULIPNEX EVENT SIMULATOR (Admin Override & Engine Sync)
 * Location: ./plugins/trading-simulasievent.js
 * Feature: Force trigger events, Broadcast to Multi-Group, and Cooldown Sync
 */

const path = require('path');
const fs = require('fs');

const eventPath = path.join(process.cwd(), 'lib', 'trading-events.js');
let eventPool = [];
if (fs.existsSync(eventPath)) {
    eventPool = require(eventPath);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem belum aktif. Tunggu Engine menyala.');
    
    let market = global.db.data.settings.trading;

    // Ambil semua grup yang mengaktifkan fitur berita trading
    let activeGroupJids = Object.entries(global.db.data.chats || {})
        .filter(([jid, chat]) => chat.tradingNews)
        .map(([jid]) => jid);

    // --- 1. COMMAND: STOPEVENT ---
    if (command === 'stopevent') {
        market.activeEvent = { title: 'STABLE', msg: 'Pasar berjalan normal.', ticker: null, mult: 1, dur: 0 };
        
        // [SYNC ENGINE]: Reset Cooldown agar mesin bisa melempar RNG lagi jika kondisi stabil
        market.eventCooldown = 0; 
        
        let msg = '✅ *EVENT STOPPED*: Pasar kembali stabil & Cooldown di-reset menjadi 0.';
        
        // Broadcast penghentian event ke grup-grup
        for (let jid of activeGroupJids) {
            if (jid !== m.chat) { // Jangan double send ke grup tempat admin ngetik
                try {
                    await conn.reply(jid, `📢 *TULIPNEX INFO*\nOtoritas Bursa (Admin) telah melakukan intervensi. Kondisi pasar kembali stabil secara paksa.`, null);
                    await delay(500);
                } catch (e) {}
            }
        }
        return m.reply(msg);
    }

    // --- 2. JIKA PERINTAH KOSONG: TAMPILKAN KATALOG EVENT ---
    if (!text) {
        let listTxt = `⚙️ *DAFTAR EVENT TULIPNEX (ADMIN)*\n──────────────────\n`;
        listTxt += `Ketik *${usedPrefix}${command} random* untuk event acak, atau pilih dari daftar di bawah:\n\n`;
        
        let grouped = {};
        for (let ev of eventPool) {
            let key = ev.ticker || 'GLOBAL';
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(ev.title);
        }

        for (let ticker in grouped) {
            listTxt += `*■ ${ticker === 'GLOBAL' ? '🌍 GLOBAL (ALL MARKET)' : `📦 TIER: ${ticker}`}*\n`;
            listTxt += grouped[ticker].map(t => `• ${t}`).join('\n');
            listTxt += `\n\n`;
        }

        listTxt += `──────────────────\n`;
        listTxt += `*Contoh Penggunaan:*\n${usedPrefix}${command} GLOBAL RECESSION`;
        
        return m.reply(listTxt.trim());
    }

    // --- 3. EKSEKUSI EVENT & SYNC ---
    let targetEvent;
    if (text.toLowerCase() === 'random') {
        targetEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
    } else {
        targetEvent = eventPool.find(e => e.title.toLowerCase() === text.toLowerCase());
    }

    if (!targetEvent) return m.reply(`[!] Event *${text}* tidak ditemukan. Cek ejaan Anda.`);

    // Set event ke database (Akan diolah oleh mesin utama di menit berikutnya)
    market.activeEvent = { ...targetEvent };
    
    // [SYNC ENGINE]: Set Cooldown selama 120 menit agar mesin tidak tumpang tindih memicu event baru
    market.eventCooldown = 120;
    
    // Catat secara manual ke dalam history 1 Jam agar terbaca oleh command cekevent
    market.eventHistory = market.eventHistory || [];
    market.eventHistory.push({
        title: `(ADMIN) ${targetEvent.title}`,
        time: Date.now()
    });
    
    let newsFlash = `📢 *TULIPNEX NEWS FLASH (ADMIN OVERRIDE)*\n──────────────────\n📰 *Event:* ${market.activeEvent.title}\n💬 ${market.activeEvent.msg}\n🎯 *Impact:* ${market.activeEvent.ticker === 'GLOBAL' ? 'SELURUH PASAR' : market.activeEvent.ticker}\n⏳ *Durasi:* ${market.activeEvent.dur} Menit\n──────────────────`;
    
    m.reply(`✅ Berhasil memicu paksa event: *${market.activeEvent.title}*\nMenyiarkan berita ke *${activeGroupJids.length}* grup terdaftar...\n_Catatan: Cooldown mesin diset ke 120 Menit._`);

    // Broadcast ke semua grup terdaftar menggunakan looping + delay (Anti Spam)
    for (let jid of activeGroupJids) {
        if (jid !== m.chat) { 
            try {
                await conn.reply(jid, newsFlash, null);
                await delay(500);
            } catch (e) {}
        }
    }
    
    // Jika admin ngetik di grup trading, kirim juga kesini sebagai penutup
    if (activeGroupJids.includes(m.chat)) {
        await conn.reply(m.chat, newsFlash, null);
    }
}

handler.help = ['setevent <judul/random>', 'stopevent']
handler.tags = ['god']
handler.command = /^(setevent|stopevent)$/i
handler.owner = true;
handler.private = true; // Dihapus agar admin bisa menggunakan ini langsung di dalam grup

module.exports = handler;