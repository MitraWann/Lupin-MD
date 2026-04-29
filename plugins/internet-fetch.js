const axios = require('axios');
const { shannz: cf } = require('bycf'); 

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) throw `Masukkan URL!\n\n*Contoh:* ${usedPrefix}${command} https://api.github.com/`;
  if (!/^https?:\/\//.test(args[0])) throw 'Awali *URL* dengan http:// atau https://';

  try {
    await m.reply(global.wait);

    // Fungsi internal untuk memproses request secara dinamis
    const fetchData = async (useBypass = false) => {
        if (useBypass) {
            // Menggunakan fungsi 'source' dari modul bycf
            let res = await cf.source(args[0]);
            
            // Memanipulasi output dari cf.source agar menyerupai struktur axios
            return {
                data: res,
                headers: {
                    'content-type': (typeof res === 'string' && res.trim().startsWith('{')) ? 'application/json' : 'text/html',
                    'content-length': res ? Buffer.byteLength(String(res)) : 0
                }
            };
        } else {
            // Metode standar menggunakan Axios
            return await axios.get(args[0], {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Referer": args[0],
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
              },
              responseType: 'arraybuffer' 
            });
        }
    };

    let fetchRes;
    try {
        fetchRes = await fetchData(false); // Coba metode standar (axios) terlebih dahulu
    } catch (err) {
        // Jika web merespon dengan kode blokir Cloudflare (403/503), beralih ke bypass bycf
        if (err.response && (err.response.status === 403 || err.response.status === 503)) {
            console.log('Terdeteksi Cloudflare, mencoba melakukan bypass dengan module bycf...');
            fetchRes = await fetchData(true);
        } else {
            throw err;
        }
    }

    // Penanganan fleksibel untuk objek response
    const headers = fetchRes?.headers || {};
    const data = fetchRes?.data || fetchRes;
    const contentType = headers['content-type'] || '';
    const contentLength = headers['content-length'] || (Buffer.isBuffer(data) ? Buffer.byteLength(data) : String(data).length);

    const size = formatSize(contentLength);
    const chSize = sizeLimit(size, '200 MB'); // PERBAIKAN: Menambahkan ' MB' di sini

    if (chSize.oversize) return conn.reply(m.chat, `🚩 Ukuran file (${size}) melebihi batas maksimal 200MB. Tautan batal dimuat.`, m);

    // Filter Response: Jika output berupa JSON API
    if (/json/i.test(contentType) || (typeof data === 'string' && data.trim().startsWith('{'))) {
        try {
            let jsonData = Buffer.isBuffer(data) ? JSON.parse(data.toString('utf-8')) : (typeof data === 'string' ? JSON.parse(data) : data);
            return m.reply(jsonFormat(jsonData));
        } catch (e) {
            // Abaikan jika ternyata gagal di-parse sebagai JSON
        }
    }

    // Filter Response: Jika output berupa HTML/Teks
    if (/text/i.test(contentType) || typeof data === 'string') {
        let textData = Buffer.isBuffer(data) ? data.toString('utf-8') : String(data);
        return m.reply(textData);
    }

    // Filter Response: Jika output berupa Media/Dokumen, langsung kirim sebagai file
    conn.sendFile(m.chat, Buffer.isBuffer(data) ? data : args[0], '', '', m);

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `🚩 *Gagal mengeksekusi:* ${e.message}`, m);
  }
};

handler.help = ['fetch', 'get'].map(v => v + ' <url>');
handler.tags = ['internet'];
handler.command = /^(fetch|get)$/i;

module.exports = handler;

// ==========================================
// KUMPULAN FUNGSI HELPER
// ==========================================

function formatSize(bytes) {
  if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sizeLimit(size, limit) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const limitSize = parseFloat(limit);
  const limitUnit = limit.replace(/[\d.]/g, '').trim();
  const limitIndex = sizes.findIndex(unit => unit === limitUnit);
  const currentSize = parseFloat(size);
  const currentUnit = size.replace(/[\d.]/g, '').trim();
  const currentIndex = sizes.findIndex(unit => unit === currentUnit);

  return {
    oversize: currentIndex > limitIndex || (currentIndex === limitIndex && currentSize > limitSize),
    currentSize, currentUnit, limitSize, limitUnit
  };
}

function jsonFormat(json) {
  return JSON.stringify(json, null, 2);
}