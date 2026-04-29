const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://multi-tools.cloud';

/**
 * Membuat Random PHP Session ID untuk mencegah bentrok antar user
 */
const generateSession = () => crypto.randomBytes(13).toString('hex');

/**
 * Header Spoofing untuk membypass Anti-Bot / Cloudflare
 */
const getHeaders = (session) => ({
    'accept': '*/*',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'x-requested-with': 'XMLHttpRequest',
    'referer': 'https://multi-tools.cloud/',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'cookie': `PHPSESSID=${session}`,
});

/**
 * Generate Email Baru
 */
const generateEmail = async (session) => {
    const res = await axios.get(`${BASE_URL}/?action=generate&_=${Date.now()}`, { headers: getHeaders(session) });
    return res.data;
};

/**
 * Simpan Status Email ke Database Server multi-tools
 */
const saveEmail = async (email, session, uptime = '232', status = 'good') => {
    const res = await axios.post(
        `${BASE_URL}/?action=save_email&_=${Date.now()}`,
        { email, uptime, status },
        {
            headers: {
                ...getHeaders(session),
                'content-type': 'application/json',
                'origin': 'https://multi-tools.cloud',
            }
        }
    );
    return res.data;
};

/**
 * Mengambil Pesan Masuk (Inbox)
 */
const getInbox = async (email, session) => {
    const res = await axios.get(
        `${BASE_URL}/?action=inbox&email=${encodeURIComponent(email)}&_=${Date.now()}`,
        { headers: getHeaders(session) }
    );
    return res.data?.result?.inbox ?? [];
};

module.exports = {
    generateSession,
    generateEmail,
    saveEmail,
    getInbox
};