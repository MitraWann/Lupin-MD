/**
 * Plugin: Scribd Scraper
 * Feature: Search Document & Get Document Info
 * Base Scraper by: (Adapted for Baileys MD)
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Class Scraper Scribd
class Scribd {
  constructor() {
    this.baseHeaders = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'max-age=0',
      'Priority': 'u=0, i',
      'Sec-Ch-Ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Linux"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0'
    };
    this.cookieString = '';
    this.client = axios.create({ timeout: 15000, maxRedirects: 5, headers: this.baseHeaders });
    
    // Interceptor untuk menangkap dan menyimpan set-cookie agar terhindar dari block
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

  async search(query) {
    try {
      const response = await this.client.get(`https://id.scribd.com/search?query=${encodeURIComponent(query)}`);
      const $ = cheerio.load(response.data);
      const results = [];
      
      $('[data-testid="search-results"] [class*="DocumentCell"], [data-e2e="search-results"] [class*="ScribdDocumentCell"]').each((i, el) => {
        const linkEl = $(el).find('a[href*="/document/"]').first();
        const titleEl = $(el).find('[class*="title"]').first();
        const authorEl = $(el).find('[class*="author"]').first();
        const thumbEl = $(el).find('img').first();
        const pagesEl = $(el).find('[class*="page"]').filter((i, el) => $(el).text().match(/\d+/)).first();
        
        const link = linkEl.attr('href');
        const docId = link ? link.match(/\/document\/(\d+)/)?.[1] : null;
        
        if (titleEl.text().trim()) {
          results.push({
            title: titleEl.text().trim(),
            author: authorEl.text().trim().replace(/^Oleh|^By/i, '').trim() || null,
            url: link ? (link.startsWith('http') ? link : `https://id.scribd.com${link}`) : null,
            docId: docId || null,
            thumbnail: thumbEl.attr('src') || null,
            pages: pagesEl.text().match(/\d+/)?.[0] || null
          });
        }
      });

      const totalResults = $('[class*="result"]').text().match(/\d+[\d,.]* hasil|\d+[\d,.]* results/)?.[0]?.match(/\d+/)?.[0] || results.length;

      return {
        success: true,
        query,
        totalResults: parseInt(totalResults) || results.length,
        results,
        count: results.length
      };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  }

  async getDocument(documentUrl) {
    try {
      const response = await this.client.get(documentUrl);
      const $ = cheerio.load(response.data);
      
      const docId = documentUrl.match(/\/document\/(\d+)/)?.[1];
      const title = $('meta[property="og:title"]').attr('content') || $('title').text().replace(' | PDF| | Scribd', '').trim();
      const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
      const imageUrl = $('meta[property="og:image"]').attr('content');
      
      const authorEl = $('[data-e2e="publish-info"] a, .publisher-info a, [class*="uploader"] a').first();
      const author = authorEl.text().trim() || $('meta[name="author"]').attr('content') || 'Unknown';
      const authorUrl = authorEl.attr('href') ? `https://id.scribd.com/${authorEl.attr('href')}` : `https://id.scribd.com/user/293063045/${author}`;

      const pageCount = $('[data-e2e="metadata-page-count-wide"]').text().match(/\d+/)?.[0] || 
                        $('[class*="pageCount"]').text().match(/\d+/)?.[0] || 
                        $('.outer_page').length || 0;

      const views = $('[data-e2e="metadata-views-count-wide"]').text().match(/[\d,.KkMmbB]+/)?.[0] || 'Unknown';

      const ratingEl = $('[data-e2e="metadata-upvote-rating"]').first();
      const ratingText = ratingEl.text().trim() || '100% (0)';
      const ratingPercent = ratingText.match(/(\d+)%/)?.[1] || '100';
      const ratingCount = ratingText.match(/\((\d+)\)/)?.[1] || '0';

      const jsonLd = $('script[type="application/ld+json"]').html();
      let structuredData = null;
      if (jsonLd) {
        try { structuredData = JSON.parse(jsonLd); } catch (e) {}
      }

      const tags = [];
      $('[class*="tag"], [class*="Tag"], .ContentTag-module_wrapper').each((i, el) => {
        const tag = $(el).text().trim();
        if (tag && !tags.includes(tag) && tag.length < 50) tags.push(tag);
      });

      const isDownloadable = $('[data-e2e="doc-actions-download-button"]').length > 0 || 
                             $('a[href*="/download"]').length > 0 || 
                             $('[class*="download"]').length > 0;

      return {
        success: true,
        data: {
          id: docId,
          title,
          description: description || 'Tidak ada deskripsi',
          url: documentUrl,
          imageUrl,
          pageCount: parseInt(pageCount),
          views,
          author: { name: author, profileUrl: authorUrl },
          ratings: {
            percent: parseInt(ratingPercent),
            count: parseInt(ratingCount)
          },
          tags: tags.length ? tags : ['Tidak ada tag'],
          download: {
            isDownloadable,
            requiresLogin: $('[data-e2e="download-requires-login"]').length > 0 || $('[class*="login"]').length > 0,
            requiresSubscription: $('[data-e2e="download-requires-subscription"]').length > 0 || $('[class*="subscribe"]').length > 0
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message, status: error.response?.status };
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let caption = `📚 *SCRIBD SEARCH & INFO*\n\n`;
        caption += `Masukkan kata kunci pencarian ATAU link dokumen Scribd.\n\n`;
        caption += `*Contoh Pencarian:*\n> ${usedPrefix}${command} proposal penelitian\n\n`;
        caption += `*Contoh Info Dokumen:*\n> ${usedPrefix}${command} https://id.scribd.com/document/440087445/proposal-penelitian`;
        return m.reply(caption);
    }

    await m.reply(global.wait || '⏳ Sedang memproses permintaan Anda...');
    
    // Inisiasi Scraper
    const scribdScraper = new Scribd();

    try {
        // DETEKSI APAKAH INPUT MERUPAKAN URL SCRIBD ATAU BUKAN
        const isScribdUrl = /(?:https?:\/\/)?(?:id\.)?scribd\.com\/(?:document|doc)\/\d+/i.test(text);

        // ==========================================
        // MENDAPATKAN INFO DARI LINK/URL
        // ==========================================
        if (isScribdUrl) {
            let docInfo = await scribdScraper.getDocument(text);
            
            if (!docInfo.success || !docInfo.data) {
                return m.reply(global.eror || `❌ Gagal mengambil data dokumen.\n*Alasan:* ${docInfo.error || 'Dokumen tidak ditemukan atau di-private.'}`);
            }

            let d = docInfo.data;
            let txt = `📄 *SCRIBD DOCUMENT INFO*\n\n`;
            txt += `🔖 *Judul:* ${d.title}\n`;
            txt += `👤 *Author:* ${d.author.name}\n`;
            txt += `📄 *Halaman:* ${d.pageCount} Halaman\n`;
            txt += `👁️ *Views:* ${d.views}\n`;
            txt += `⭐ *Rating:* ${d.ratings.percent}% (${d.ratings.count} Votes)\n\n`;
            
            txt += `*🏷️ Tags:* ${d.tags.join(', ')}\n\n`;
            
            let desc = d.description.length > 300 ? d.description.substring(0, 300) + '...' : d.description;
            txt += `📝 *Deskripsi:*\n${desc}\n\n`;
            
            txt += `⬇️ *Dapat Didownload:* ${d.download.isDownloadable ? '✅ Ya' : '❌ Tidak'}\n`;
            txt += `🔗 *Link Ori:* ${d.url}`;

            // Kirim pesan dengan thumbnail jika tersedia
            if (d.imageUrl) {
                return conn.sendFile(m.chat, d.imageUrl, 'scribd.jpg', txt, m);
            } else {
                return m.reply(txt);
            }
        } 
        // ==========================================
        // MELAKUKAN PENCARIAN BERDASARKAN KATA KUNCI
        // ==========================================
        else {
            let searchRes = await scribdScraper.search(text);
            
            if (!searchRes.success || searchRes.results.length === 0) {
                return m.reply(`❌ Tidak ditemukan dokumen untuk pencarian: *${text}*`);
            }

            let txt = `📚 *SCRIBD SEARCH RESULTS*\n🔎 *Pencarian:* ${text}\n📊 *Total Hasil:* ${searchRes.totalResults}\n\n`;
            
            // Batasi output maksimal 10 dokumen agar tidak spam
            let limit = Math.min(searchRes.results.length, 10);
            for (let i = 0; i < limit; i++) {
                let res = searchRes.results[i];
                txt += `*${i + 1}. ${res.title}*\n`;
                txt += `👤 Oleh: ${res.author || 'Unknown'}\n`;
                txt += `📄 Halaman: ${res.pages || '?'}\n`;
                txt += `🔗 Link: ${res.url}\n\n`;
            }
            
            txt += `_Gunakan command *${usedPrefix}${command} <link>* untuk melihat detail._`;
            return m.reply(txt);
        }

    } catch (err) {
        console.error(err);
        return m.reply(global.eror || '❌ Terjadi kesalahan pada internal server.');
    }
};

handler.help = ['scribd <query/link>'];
handler.tags = ['internet', 'tools'];
handler.command = /^(scribd|scribdsearch)$/i;

// Karena mengambil data via scraping yang rawan kena ban IP, set limit = true
handler.limit = true; 

module.exports = handler;