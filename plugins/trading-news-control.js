/**
 * TULIPNEX NEWS CONTROL (MULTI-GROUP)
 * Location: ./plugins/trading-news-control.js
 * Feature: Turn on/off the market announcer in a specific group
 */

let handler = async (m, { conn, command }) => {
    try {
        let chat = global.db.data.chats[m.chat];
        if (!chat) return m.reply('[!] Database chat belum siap.');

        let action = (command || '').toLowerCase();

        if (action === 'setnews' || action === 'setnew') {
            chat.tradingNews = true;
            return m.reply('✅ *Saluran Berita DIAKTIFKAN di grup ini.*\n\nSemua kejadian (*Market Event*) dari sistem TulipNex akan otomatis disiarkan di grup ini setiap pergantian menit.');
        }
        
        if (action === 'stopnews') {
            chat.tradingNews = false;
            return m.reply('❌ *Saluran Berita DIMATIKAN.*\n\nGrup ini tidak akan lagi menerima siaran fluktuasi harga otomatis.');
        }
    } catch (e) {
        console.error(e);
        return m.reply('⚠️ Terjadi error pada sistem pengatur berita.');
    }
}

handler.help = ['setnews', 'stopnews'];
handler.tags = ['tulipnex'];
handler.command = /^(setnews|stopnews)$/i;
handler.admin = true;
handler.group = true; 

module.exports = handler;