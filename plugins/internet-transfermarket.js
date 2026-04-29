/**
 * PLUGIN TRANSFERMARKT SEARCH
 * Fitur: Mencari informasi detail pemain sepak bola
 * Lokasi: ./plugins/internet-transfermarkt.js
 */

const axios = require('axios');
const cheerio = require('cheerio');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Contoh:* ${usedPrefix}${command} Cristiano Ronaldo`);

    await m.reply(global.wait);

    try {
        const scraper = new Transfermarkt();
        const result = await scraper.getPlayer(text);

        if (!result || !result.detail.name) throw 'Pemain tidak ditemukan.';

        const { detail } = result;
        
        let caption = `⚽ *PROFIL PEMAIN SEPAK BOLA*\n\n`;
        caption += `- *Nama:* ${detail.name}\n`;
        caption += `- *Klub:* ${detail.club}\n`;
        caption += `- *Posisi:* ${detail.position}\n`;
        caption += `- *Nilai Pasar:* ${detail.marketValue}\n`;
        caption += `- *Kewarganegaraan:* ${detail.nationality}\n`;
        caption += `- *Umur/Lahir:* ${detail.age}\n`;
        caption += `- *Tempat Lahir:* ${detail.birthplace}\n`;
        caption += `- *Tinggi:* ${detail.height}\n`;
        caption += `- *Kaki Dominan:* ${detail.foot}\n`;
        caption += `- *Agen:* ${detail.agent}\n`;
        caption += `- *Kontrak:* ${detail.contract}\n`;
        caption += `- *Bergabung:* ${detail.joined}\n\n`;

        if (detail.stats && detail.stats.length > 0) {
            caption += `📊 *STATISTIK MUSIM INI*\n`;
            detail.stats.slice(0, 5).forEach(s => {
                caption += `┌  ◦ *${s.competition}*\n`;
                caption += `└  ◦ Apps: ${s.apps} | G: ${s.goals} | A: ${s.assists}\n`;
            });
        }

        caption += `\n> Data source: Transfermarkt.co.id`;

        // Kirim gambar profil pemain beserta detailnya
        await conn.sendFile(m.chat, detail.image || detail.clubLogo, 'player.jpg', caption, m);

    } catch (e) {
        console.error(e);
        m.reply(`⚠️ *Error:* ${e?.message || 'Gagal mengambil data pemain. Pastikan nama yang dicari benar.'}`);
    }
};

// --- Scraper Engine (Integrated) ---
class Transfermarkt {
    constructor() {
        this.baseUrl = 'https://www.transfermarkt.co.id';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };
    }

    async getPlayer(query) {
        const searchUrl = `${this.baseUrl}/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, { headers: this.headers });
        const $ = cheerio.load(data);

        const firstRow = $('#player-grid tbody tr').first();
        const detailUrl = firstRow.find('.hauptlink a').first().attr('href');
        if (!detailUrl) return null;

        const detailUrlFull = detailUrl.startsWith('http') ? detailUrl : this.baseUrl + detailUrl;
        const detailData = await axios.get(detailUrlFull, { headers: this.headers });
        const $$ = cheerio.load(detailData.data);

        const info = {};
        $$('.info-table .info-table__content').each((i, el) => {
            const text = $$(el).text().trim().replace(/\s+/g, ' ');
            if (i % 2 === 0) {
                info.label = text;
            } else if (info.label) {
                info[info.label] = text;
            }
        });

        const stats = [];
        $$('.responsive-table table tbody tr').each((i, el) => {
            const cols = $$(el).find('td');
            if (cols.length >= 4) {
                const competition = $$(cols[0]).text().trim().replace(/\s+/g, ' ');
                const apps = $$(cols[1]).text().trim();
                const goals = $$(cols[2]).text().trim();
                const assists = $$(cols[3]).text().trim();
                if (competition && !competition.includes('Total')) {
                    stats.push({ competition, apps, goals, assists });
                }
            }
        });

        const marketValueText = $$('.data-header__market-value-wrapper').first().text().trim().replace(/\s+/g, ' ');

        return {
            detail: {
                name: $$('h1').first().text().trim().replace(/\s+/g, ' ').replace(/#\d+/, '').trim(),
                image: $$('.data-header__profile-image').attr('src') || null,
                club: $$('.data-header__club a').first().text().trim() || 'N/A',
                clubLogo: $$('.data-header__box--big img').first().attr('src') || null,
                age: info['Tanggal lahir / Umur:'] || 'N/A',
                birthplace: info['Tempat kelahiran:']?.replace(/[^\w\s,]/g, '').trim() || 'N/A',
                height: info['Tinggi:'] || 'N/A',
                nationality: info['Kewarganegaraan:']?.replace(/\s+/g, ' ').trim() || 'N/A',
                position: info['Posisi:'] || 'N/A',
                foot: info['Kaki dominan:'] || 'N/A',
                agent: info['Agen pemain:']?.replace(/\s+/g, ' ').trim() || 'N/A',
                joined: info['Bergabung:'] || 'N/A',
                contract: info['Kontrak berakhir:'] || 'N/A',
                marketValue: marketValueText.split('Update')[0].trim() || 'N/A',
                stats
            }
        };
    }
}

handler.help = ['transfermarkt <nama pemain>'];
handler.tags = ['internet'];
handler.command = /^(transfermarket|tm)$/i;
handler.limit = true;

module.exports = handler;