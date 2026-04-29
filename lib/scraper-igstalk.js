const axios = require('axios');

/**
 * [ API REVERSE ENGINEERING & SCRAPING ]
 * Scraper Boostfluence dipisahkan ke dalam folder /lib
 * Bertugas melakukan spoofing headers untuk menghindari pemblokiran WAF.
 */
async function igStalk(username) {
    try {
        const url = 'https://api.boostfluence.com/api/instagram-profile-v2';
        
        const data = {
            username: username.replace('@', '') // Membersihkan input
        };

        // Header Spoofing untuk membypass proteksi anti-bot
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
            'Content-Type': 'application/json',
            'Origin': 'https://www.boostfluence.com',
            'Referer': 'https://www.boostfluence.com/free-tools/instagram-profile-viewer',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        };

        const response = await axios.post(url, data, { headers });

        if (response.data && response.data.username) {
            return response.data;
        } else {
            throw new Error('Data profile tidak ditemukan atau API sedang down.');
        }

    } catch (error) {
        console.error('[Boostfluence API Error]', error.response?.data || error.message);
        throw error; // Lempar error ke plugin untuk ditangkap catch block
    }
}

module.exports = { igStalk };