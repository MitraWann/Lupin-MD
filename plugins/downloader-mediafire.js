/**
 * PLUGIN MEDIAFIRE DOWNLOADER
 * Fitur: Mengunduh file dan mengekstrak metadata dari tautan MediaFire
 * Lokasi: ./plugins/downloader-mediafire.js
 */

const axios = require('axios');
const cheerio = require('cheerio');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Contoh:* ${usedPrefix}${command} https://www.mediafire.com/file/xxxx/file`);
    
    // Validasi URL
    if (!text.match(/mediafire\.com/gi)) {
        return m.reply('⚠️ URL MediaFire tidak valid!');
    }

    await m.reply(global.wait);

    try {
        const downloader = new MediaFire();
        const result = await downloader.getFileInfo(text);

        if (!result.success || !result.data.directDownloadUrl) {
            throw 'Gagal mendapatkan link download. Pastikan file tidak diproteksi password atau dihapus.';
        }

        const { data } = result;

        // Menyusun caption informasi file
        let caption = `📁 *MEDIAFIRE DOWNLOADER*\n\n`;
        caption += `┌  ◦ *Nama File:* ${data.fileName || 'Unknown'}\n`;
        caption += `│  ◦ *Ukuran:* ${data.fileSize || '-'}\n`;
        caption += `│  ◦ *Tipe:* ${data.fileExtension || '-'}\n`;
        caption += `│  ◦ *Diunggah:* ${data.uploadDate || '-'}\n`;
        caption += `└  ◦ *Dilihat:* ${data.views || '-'}\n\n`;
        caption += `> ⏳ _Sedang mengirim file, mohon tunggu..._`;

        await m.reply(caption);

        // Mengirim file sebagai dokumen ke pengguna
        await conn.sendMessage(m.chat, { 
            document: { url: data.directDownloadUrl }, 
            fileName: data.fileName,
            mimetype: 'application/octet-stream' // Mimetype standar untuk mencegah file menjadi bin
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply(`⚠️ *Error:* ${e?.message || 'Gagal mengunduh dari MediaFire.'}`);
    }
};

// --- Scraper Engine (Integrated) ---
class MediaFire {
  constructor() {
    this.baseHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'max-age=0',
      'Priority': 'u=0, i',
      'Sec-Ch-Ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Linux"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
    };
    this.cookieString = '';
    this.client = axios.create({ timeout: 30000, maxRedirects: 5, headers: this.baseHeaders });
    this.client.interceptors.response.use((response) => {
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        setCookieHeader.forEach(cookie => {
          const cookieParts = cookie.split(';')[0].split('=');
          if (cookieParts.length >= 2) {
            const cookieName = cookieParts[0];
            const cookieValue = cookieParts.slice(1).join('=');
            if (!this.cookieString.includes(`${cookieName}=`)) {
              this.cookieString += (this.cookieString ? '; ' : '') + `${cookieName}=${cookieValue}`;
            }
          }
        });
        this.client.defaults.headers.common['Cookie'] = this.cookieString;
      }
      return response;
    });
  }

  async getFileInfo(url) {
    const response = await this.client.get(url);
    const $ = cheerio.load(response.data);
    
    const downloadLink = $('#downloadButton').attr('href');
    const directLink = downloadLink || null;
    
    const fileName = $('.dl-btn-label').attr('title') || $('.promoDownloadName .dl-btn-label').text().trim() || null;
    
    const fileSize = $('.download_link .input').text().match(/\(([^)]+)\)/)?.[1] || 
                     $('.download_link a').text().match(/\(([^)]+)\)/)?.[1] || 
                     $('.download_link .input').text().match(/\(([^)]+)\)/)?.[1] || 
                     $('.details .size').text().trim() || null;
    
    const fileIcon = $('.icon').attr('class').split(' ').filter(c => c !== 'icon' && c !== 'zip' && c !== 'archive').join(' ') || null;
    
    const fileExtension = fileName ? fileName.split('.').pop() : null;
    
    const securityToken = $('input[name="security"]').val() || null;
    
    const quickKey = url.match(/\/file\/([a-z0-9]+)\//i)?.[1] || null;
    
    const uploadDate = $('.upload_date, .upload-date, .file-upload-date, [class*="upload"] time').text().trim() || 
                       $('time[datetime]').attr('datetime') || 
                       $('.details .date').text().trim() || null;
    
    const description = $('meta[name="description"]').attr('content') || 
                        $('.description').text().trim() || null;
    
    const views = $('.download_count, .views_count, .file-views, [class*="view"]').text().match(/\d+/)?.[0] || 
                  $('.stats .views').text().match(/\d+/)?.[0] || null;
    
    const isPasswordProtected = $('input[type="password"]').length > 0;
    
    const requiresLogin = $('a[href*="/login/"]').length > 0 || $('.header .actions a[href*="/login/"]').length > 0;
    
    const alternativeLinks = [];
    $('a[href*="/file/"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href !== url && !alternativeLinks.includes(href)) {
        alternativeLinks.push(href.startsWith('http') ? href : `https://www.mediafire.com${href}`);
      }
    });
    
    return {
      success: true,
      data: {
        fileName,
        fileSize,
        fileExtension,
        fileIcon,
        directDownloadUrl: directLink,
        mediafireUrl: url,
        quickKey,
        securityToken,
        views,
        uploadDate,
        isPasswordProtected,
        requiresLogin,
        alternativeLinks: alternativeLinks.slice(0, 5)
      }
    };
  }
}

handler.help = ['mediafire <url>'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mf)$/i;
handler.limit = true;

module.exports = handler;