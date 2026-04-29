const { tiktokStalk } = require('../lib/scrape-tiktokprofile');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input User
    if (!text) {
        return m.reply(`Masukkan username TikTok yang ingin dicari!\n\n*Contoh:* ${usedPrefix + command} _zeeasadel`);
    }
    
    // 2. Simulasi Loading menggunakan variabel global (sesuai config.js)
    m.reply(global.wait);
    
    try {
        // 3. Hit API via Scraper
        let res = await tiktokStalk(text);
        
        if (!res || !res.data) {
            return m.reply(global.eror);
        }
        
        let user = res.data.user;
        let stats = res.data.stats;
        
        // 4. Formatting Output (Rapi & Mudah Dibaca)
        let caption = `*T I K T O K - S T A L K*\n\n`
        caption += `👤 *Nama:* ${user.nickname || '-'}\n`
        caption += `🔖 *Username:* @${user.uniqueId || '-'}\n`
        caption += `👥 *Followers:* ${formatNumber(stats.followerCount)}\n`
        caption += `🫂 *Following:* ${formatNumber(stats.followingCount)}\n`
        caption += `❤️ *Likes:* ${formatNumber(stats.heartCount)}\n`
        caption += `🎬 *Video:* ${formatNumber(stats.videoCount)}\n`
        caption += `✅ *Verified:* ${user.verified ? 'Ya' : 'Tidak'}\n`
        caption += `🔒 *Private:* ${user.privateAccount ? 'Ya' : 'Tidak'}\n\n`
        caption += `📝 *Bio:*\n${user.signature ? user.signature : 'Tidak ada bio.'}`
        
        // Menentukan foto profil dengan resolusi terbesar
        let avatarUrl = user.avatarLarger || user.avatarMedium || user.avatarThumb;
        
        // 5. Mengirimkan File Media (Gambar + Teks) menggunakan native Baileys
        await conn.sendMessage(m.chat, { 
            image: { url: avatarUrl }, 
            caption: caption 
        }, { quoted: m });
        
    } catch (e) {
        console.error(`[TikTok Stalk Plugin Error] ${e.message}`);
        m.reply(global.eror); // Pesan error dari global variable (config.js)
    }
}

// Helper untuk format angka (contoh: 1000000 -> 1.000.000)
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Metadata Plugin
handler.help = ['tiktokstalk <username>', 'ttstalk <username>'];
handler.tags = ['internet'];
handler.command = /^(ttstalk|tiktokstalk)$/i;

// Flag Keamanan (Sesuai role dan modul Baileys)
handler.limit = true; // Mengurangi limit (sesuai logika handler.js bawaan Anda)

module.exports = handler;