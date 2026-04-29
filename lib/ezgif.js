const axios = require('axios')
const cheerio = require('cheerio')
const FormData = require('form-data')

/**
 * Custom Scraper Engine untuk Ezgif 
 * @param {Buffer} buffer - Buffer media webp
 * @param {String} type - endpoint tujuan ('webp-to-mp4' atau 'webp-to-png')
 * @returns {Promise<String>} URL hasil render
 */
async function ezgifConvert(buffer, type) {
    return new Promise(async (resolve, reject) => {
        try {
            let form = new FormData()
            form.append('new-image-url', '')
            form.append('new-image', buffer, 'image.webp')

            // Header Spoofing agar lolos WAF/Anti-bot Ezgif
            const headers = {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Origin': 'https://ezgif.com',
                'Referer': `https://ezgif.com/${type}`
            }

            // Tahap 1: Upload Buffer
            let res = await axios({
                method: 'post',
                url: `https://s6.ezgif.com/${type}`,
                data: form,
                headers: headers
            })

            // Tahap 2: Ekstrak Token & Hidden Data
            let $ = cheerio.load(res.data)
            let file = $('input[name="file"]').attr('value')
            let token = $('input[name="token"]').attr('value')
            let convert = $('input[name="convert"]').attr('value')

            if (!file || !token) throw new Error('Gagal mengekstrak form token dari Ezgif')

            let form2 = new FormData()
            form2.append('file', file)
            form2.append('token', token)
            form2.append('convert', convert || 'Convert webp!')

            // Tahap 3: Trigger proses konversi
            let res2 = await axios({
                method: 'post',
                url: `https://ezgif.com/${type}/${file}`,
                data: form2,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${form2._boundary}`,
                    'User-Agent': headers['User-Agent'],
                    'Referer': `https://s6.ezgif.com/${type}`
                }
            })

            // Tahap 4: Ekstrak URL Final
            let $2 = cheerio.load(res2.data)
            let resultUrl = $2('div#output > p.outfile > video > source').attr('src') || $2('div#output > p.outfile > img').attr('src')

            if (!resultUrl) throw new Error('Hasil konversi tidak ditemukan di halaman response')

            resolve('https:' + resultUrl)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { ezgifConvert }