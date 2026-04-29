const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

class YouPorn {
  constructor() {
    this.client = axios.create({
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.youporn.com/"
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }

  async search(text) {
    try {
      const { data } = await this.client.get(
        `https://www.youporn.com/search/?query=${encodeURIComponent(text)}`
      );
      const $ = cheerio.load(data);
      const results = [];

      $("article.video-box").each((i, el) => {
        const article = $(el);
        const videoId = article.attr("data-video-id");
        const title = article.find("a.video-title-text").text().trim() || article.attr("aria-label");
        const linkPath = article.find("a.video-title-text").attr("href");
        
        if (videoId && linkPath) {
          results.push({
            videoId,
            title,
            link: `https://www.youporn.com${linkPath}`,
            views: article.find(".info-views").first().text().trim(),
            rating: article.find(".icon-pink-thumb-up").parent().text().trim()
          });
        }
      });
      return results;
    } catch (err) {
      console.error("YouPorn Search Error:", err.message);
      return [];
    }
  }

  async getVideo(url) {
    try {
      const { data: html } = await this.client.get(url);
      // Mencari definisi media di dalam script tag
      const match = html.match(/mediaDefinition\s*:\s*(\[[\s\S]*?\])/);
      if (!match) return null;

      let mediaDefinition;
      try {
        // Menggunakan JSON.parse dengan pembersihan string karena eval berisiko
        const jsonStr = match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":');
        mediaDefinition = JSON.parse(jsonStr);
      } catch (e) {
        // Fallback ke eval jika regex gagal memformat JSON (unsafe but effective for obfuscated scripts)
        mediaDefinition = eval(match[1]);
      }

      const mp4Data = mediaDefinition.find(v => v.format === "mp4");
      if (!mp4Data) return null;

      // Hit endpoint untuk mendapatkan list resolusi
      const { data: sources } = await this.client.get(mp4Data.videoUrl);
      
      // Mengambil kualitas tertinggi (biasanya urutan terakhir di array)
      const highQuality = sources[sources.length - 1];
      
      return {
        title: html.match(/<title>(.*?)<\/title>/)?.[1] || "YouPorn Video",
        videoUrl: highQuality.videoUrl,
        quality: highQuality.quality
      };
    } catch (err) {
      console.error("YouPorn GetVideo Error:", err.message);
      return null;
    }
  }
}

module.exports = new YouPorn();