/**
 * Plugin: Spotify Search & Downloader
 * Description: Mencari dan mengunduh lagu dari Spotify
 * Author: Senior Bot Developer
 */

const spotify = require('../lib/spotify');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validasi Input Dasar
    if (!text) {
        let txt = `*Contoh Penggunaan:*\n`;
        txt += `⭔ *Pencarian:* ${usedPrefix}${command} about you\n`;
        txt += `⭔ *Download:* ${usedPrefix}${command} https://open.spotify.com/track/3hEfpBHxgieRLz4t3kLNEg`;
        return m.reply(txt);
    }

    // 2. Memberikan response feedback agar user tahu request diproses
    await m.reply(global.wait || '⏳ _Sedang memproses..._');

    try {
        // 3. Deteksi Input: Apakah berupa Link Download atau Query Pencarian?
        const isUrl = text.match(/spotify\.com/i);

        if (isUrl) {
            // ==========================================
            // MODE DOWNLOADER
            // ==========================================
            const res = await spotify.download(text);

            if (!res.status) throw res.msg || `Gagal mengambil data dari Spotify.`;

            // Ekstraksi Data dari module library
            let { title, artist, album, cover, releaseDate } = res.metadata;
            let audioUrl = res.download.mp3;

            // Merakit Caption (Tetap mempertahankan UX dari spotify2.js)
            let caption = `🎵 *S P O T I F Y - D L*\n\n`;
            caption += `🎧 *Judul:* ${title}\n`;
            caption += `🎤 *Artis:* ${artist}\n`;
            caption += `💿 *Album:* ${album}\n`;
            caption += `📅 *Rilis:* ${releaseDate}\n\n`;
            caption += `_Tunggu sebentar, file audio sedang dikirim..._`;

            // Kirim Cover Image dengan Caption
            await conn.sendFile(m.chat, cover, 'cover.jpg', caption, m);

            // Kirim File Audio (MP3)
            await conn.sendMessage(m.chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mpeg', 
                fileName: `${title}.mp3`,
                ptt: false // Set true jika ingin berbentuk Voice Note
            }, { quoted: m });

        } else {
            // ==========================================
            // MODE SEARCH
            // ==========================================
            const res = await spotify.search(text);
            
            if (!res.status) throw `❌ Lagu *${text}* tidak ditemukan di Spotify.`;

            const tracks = res.data;
            let txt = `🎧 *S P O T I F Y  S E A R C H*\n\n`;
            let limit = Math.min(10, tracks.length); // Membatasi output max 10 agar tidak spammy
            
            // Looping dan format hasil (UX dari spotify.js)
            for (let i = 0; i < limit; i++) {
                let track = tracks[i];
                let title = track.title || track.name || '-';
                let artist = track.artist || track.artists || track.author || 'Unknown';
                let duration = track.duration || track.timestamp || '-';
                let url = track.url || track.link || '-';

                txt += `*${i + 1}. ${title}*\n`;
                txt += `🎤 *Artis:* ${artist}\n`;
                if (duration !== '-') txt += `⏱️ *Durasi:* ${duration}\n`;
                txt += `🔗 *Link:* ${url}\n\n`;
            }

            txt += `> _Gunakan perintah *${usedPrefix}${command} <link>* untuk mengunduh lagu di atas._`;

            // Ambil thumbnail dari hasil pertama jika tersedia
            let thumb = tracks[0].image || tracks[0].thumbnail || tracks[0].cover || null;

            if (thumb) {
                await conn.sendFile(m.chat, thumb, 'spotify.jpg', txt.trim(), m);
            } else {
                await m.reply(txt.trim());
            }
        }

    } catch (e) {
        console.error('[Plugin Spotify Error]', e);
        // Fallback error menggunakan format error global
        m.reply(typeof e === 'string' ? e : (global.eror || '❌ Terjadi kesalahan pada server kami.'));
    }
}

// Metadata Plugin standar Baileys Bot
handler.help = ['spotify'].map(v => v + ' <judul lagu/link>');
handler.tags = ['downloader'];
handler.command = /^(spotify(dl|search)?)$/i; // Fleksibel menerima .spotify, .spotifydl, .spotifysearch

// Flag Keamanan & Batasan Penggunaan
handler.limit = true; // Mengurangi limit bot pengguna
handler.group = false; // Boleh digunakan di PC maupun Grup

module.exports = handler;