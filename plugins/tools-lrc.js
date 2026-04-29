const axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Inisialisasi tempat penyimpanan sesi lirik
  conn.lrcSession = conn.lrcSession || {};

  if (!text) {
    return m.reply(`Masukkan judul lagu yang ingin dicari liriknya!\n\n*Contoh:* ${usedPrefix + command} fuji kaze shinunoga e-wa`);
  }

  try {
    // Mengirim pesan loading
    m.reply(global.wait);

    // Endpoint API resmi LRCLIB
    let apiUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(text)}`;
    let res = await axios.get(apiUrl);
    let data = res.data;

    // Cek apakah data ditemukan
    if (!data || data.length === 0) {
      return m.reply('❌ Lirik tidak ditemukan untuk pencarian tersebut.');
    }

    // Bersihkan sesi lama jika pengguna melakukan pencarian baru
    if (conn.lrcSession[m.sender]) clearTimeout(conn.lrcSession[m.sender].timeout);

    // Simpan hasil pencarian ke dalam session bot
    conn.lrcSession[m.sender] = {
      data: data,
      page: 1,
      query: text,
      // Hapus sesi otomatis setelah 5 menit untuk mencegah kebocoran memori
      timeout: setTimeout(() => {
        delete conn.lrcSession[m.sender];
      }, 5 * 60 * 1000)
    };

    // Pagination: Menyiapkan 10 hasil pertama
    let limit = 10;
    let totalPages = Math.ceil(data.length / limit);
    let chunk = data.slice(0, limit);

    let caption = `🎵 *Hasil Pencarian Lirik: ${text}*\n\n`;
    chunk.forEach((song, i) => {
      // Perubahan: Hanya menampilkan judul dan penyanyi
      caption += `${i + 1}. ${song.trackName} - ${song.artistName}\n`;
    });

    caption += `\n*Halaman 1/${totalPages}*`;
    caption += `\n\n> Balas pesan ini dengan *nomor* untuk melihat lirik.`;
    if (totalPages > 1) {
      caption += `\n> Balas pesan ini dengan *next* untuk halaman selanjutnya.`;
    }

    await conn.reply(m.chat, caption, m);

  } catch (e) {
    console.error(e);
    m.reply(global.eror);
  }
}

// Handler Before untuk menangkap balasan (reply) dari pengguna
handler.before = async function (m, { conn }) {
  conn.lrcSession = conn.lrcSession || {};
  let session = conn.lrcSession[m.sender];

  // Hanya proses jika sesi ada, pesan tidak kosong, dan pesan mereply pesan bot
  if (!session || m.isBaileys || !m.text || !m.quoted || !m.quoted.fromMe) return;

  let text = m.text.trim().toLowerCase();
  let limit = 10;
  let totalPages = Math.ceil(session.data.length / limit);

  // Jika pengguna membalas "next"
  if (text === 'next') {
    if (session.page >= totalPages) {
      return m.reply('❌ Ini adalah halaman terakhir pencarian.');
    }

    session.page += 1;
    let start = (session.page - 1) * limit;
    let end = start + limit;
    let chunk = session.data.slice(start, end);

    let caption = `🎵 *Hasil Pencarian Lirik: ${session.query}*\n\n`;
    chunk.forEach((song, i) => {
      // Perubahan: Hanya menampilkan judul dan penyanyi
      caption += `${start + i + 1}. ${song.trackName} - ${song.artistName}\n`;
    });

    caption += `\n*Halaman ${session.page}/${totalPages}*`;
    caption += `\n\n> Balas pesan ini dengan *nomor* untuk melihat lirik.`;
    if (session.page > 1) {
      caption += `\n> Balas pesan ini dengan *prev* untuk kembali.`;
    }
    if (session.page < totalPages) {
      caption += `\n> Balas pesan ini dengan *next* untuk lanjut.`;
    }

    // Reset timeout agar pengguna punya waktu merespons halaman baru
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
      delete conn.lrcSession[m.sender];
    }, 5 * 60 * 1000);

    return conn.reply(m.chat, caption, m);
  }

  // Jika pengguna membalas "prev" atau "back"
  if (text === 'prev' || text === 'back') {
    if (session.page <= 1) {
      return m.reply('❌ Ini sudah halaman pertama.');
    }

    session.page -= 1;
    let start = (session.page - 1) * limit;
    let end = start + limit;
    let chunk = session.data.slice(start, end);

    let caption = `🎵 *Hasil Pencarian Lirik: ${session.query}*\n\n`;
    chunk.forEach((song, i) => {
      // Perubahan: Hanya menampilkan judul dan penyanyi
      caption += `*${start + i + 1}.* ${song.trackName} - ${song.artistName}\n`;
    });

    caption += `\n*Halaman ${session.page}/${totalPages}*`;
    caption += `\n\n> Balas pesan ini dengan *nomor* untuk melihat lirik.`;
    if (session.page > 1) {
      caption += `\n> Balas pesan ini dengan *prev* untuk kembali.`;
    }
    if (session.page < totalPages) {
      caption += `\n> Balas pesan ini dengan *next* untuk lanjut.`;
    }

    // Reset timeout agar pengguna punya waktu merespons halaman baru
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => {
      delete conn.lrcSession[m.sender];
    }, 5 * 60 * 1000);

    return conn.reply(m.chat, caption, m);
  }

  // Jika pengguna membalas dengan Nomor Pilihan (angka)
  if (!isNaN(text) && text.length > 0) {
    let choice = parseInt(text);

    // Validasi input angka sesuai panjang data
    if (choice < 1 || choice > session.data.length) return; 

    let song = session.data[choice - 1];
    let title = song.trackName || 'Tidak diketahui';
    let artist = song.artistName || 'Tidak diketahui';
    // Info album tetap dipertahankan pada saat menampilkan detail lirik
    let album = song.albumName || 'Tidak diketahui';
    
    // Mengutamakan lirik tersinkronisasi (LRC)
    let lyricsText = song.syncedLyrics || song.plainLyrics;

    if (lyricsText) {
      let caption = `*Judul:* ${title}\n*Artis:* ${artist}\n*Album:* ${album}\n\n*Lirik:*\n${lyricsText}`;
      
      // Kirim lirik final
      await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
    } else {
      m.reply(`❌ Lagu *${title}* oleh *${artist}* ditemukan, tetapi liriknya belum tersedia di database.`);
    }

    // Hapus sesi setelah pengguna berhasil memilih (agar tidak memenuhi memory bot)
    clearTimeout(session.timeout);
    delete conn.lrcSession[m.sender];
    return true; // Hentikan eksekusi handler lainnya
  }
}

handler.help = ['lrc <judul>'];
handler.tags = ['tools'];
handler.command = /^(lrc|lrclib|lyrics)$/i;

module.exports = handler;