const os = require('os');
const fetch = require('node-fetch');

let handler = async (m, { conn }) => {
  try {
    // Reaksi loading
    //await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

    let response = await fetch('https://freeipapi.com/api/json');
    let json = await response.json();

    // Kalkulasi RAM & Uptime
    let ramUsed = formatSize(os.totalmem() - os.freemem());
    let ramTotal = formatSize(os.totalmem());
    let uptime = toTime(os.uptime() * 1000);

    // Filter Data API agar tidak berantakan
    let ipAddress = json.ipAddress || 'N/A';
    let ipVersion = json.ipVersion || '-';
    let city = json.cityName || 'N/A';
    let region = json.regionName || 'N/A';
    let country = json.countryName || 'N/A';
    let countryCode = json.countryCode || '-';
    
    // Perbaikan zona waktu
    let timeZone = (json.timeZones && json.timeZones.length > 0) ? json.timeZones[0] : 'N/A';
    
    // ==========================================
    // PERBAIKAN BUG CURRENCY "UNDEFINED"
    // ==========================================
    let currency = 'N/A';
    if (json.currencies && json.currencies.length > 0) {
        // Jika formatnya Objek (contoh: {code: "IDR"}) ambil .code, jika teks biasa ("IDR") langsung ambil teksnya
        currency = json.currencies[0].code || json.currencies[0] || 'N/A';
    }

    // Desain UI Baru yang Lebih Bersih
    let txt = `🌐 *SERVER INFORMATION*
────────────────────

🖥️ *H A R D W A R E*
» *OS:* ${os.type()} (${os.arch()})
» *Release:* ${os.release()}
» *Processor:* ${os.cpus()[0].model.trim()}
» *RAM:* ${ramUsed} / ${ramTotal}
» *Uptime:* ${uptime}

🌍 *N E T W O R K   &   I P*
» *IP Address:* ${ipAddress} (IPv${ipVersion})
» *Location:* ${city}, ${region}
» *Country:* ${country} (${countryCode})
» *Timezone:* ${timeZone}
» *Currency:* ${currency}`;

    await conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: txt,
        contextInfo: {
          externalAdReply: {
            title: `SERVER INFORMATION - WANN BOT`,
            body: `Powered by TulipNex`,
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnailUrl: 'https://files.catbox.moe/mrfys5.jpg',
            sourceUrl: ''
          }
        },
        mentions: [m.sender]
      }
    }, {});

    // Reaksi sukses
    //await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.log(error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    m.reply('⚠️ Terjadi kesalahan saat mengambil informasi server dari API.');
  }
};

handler.command = handler.help = ['server'];
handler.tags = ['info'];
handler.owner = true; // Hanya bisa diakses owner

module.exports = handler;

// Fungsi format ukuran (Bytes, KB, MB, GB)
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return (Math.round(bytes / Math.pow(1024, i) * 100) / 100) + ' ' + sizes[i];
}

// Fungsi format waktu yang diubah ke Bahasa Indonesia agar rapi
function toTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  return `${days} Hari ${hours % 24} Jam ${minutes % 60} Menit ${seconds % 60} Detik`
    .replace(/0 Hari 0 Jam 0 Menit /g, '')
    .replace(/0 Hari 0 Jam /g, '')
    .replace(/0 Hari /g, '')
    .trim();
}