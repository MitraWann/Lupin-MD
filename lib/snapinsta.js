const cloudscraper = require('cloudscraper');
const vm = require('vm');

const BASE_URL = 'https://snapinsta.to';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/en2`,
};

/**
 * Mendapatkan token dari API userverify
 */
async function getToken(instagramUrl, jar) {
    const formData = `url=${encodeURIComponent(instagramUrl)}`;
    const response = await cloudscraper.post({
        uri: `${BASE_URL}/api/userverify`,
        headers,
        body: formData,
        jar,
        simple: false,
        resolveWithFullResponse: true,
    });

    if (response.statusCode !== 200) {
        throw new Error(`Token request failed with status ${response.statusCode}`);
    }

    const data = JSON.parse(response.body);
    if (!data.success) {
        throw new Error('Token generation failed: ' + (data.message || 'Unknown error'));
    }
    return data.token;
}

/**
 * Mengambil data obfuscated (kode JavaScript terenkripsi) dari API ajaxSearch
 */
async function getObfuscatedData(instagramUrl, token, jar) {
    const formData = `q=${encodeURIComponent(instagramUrl)}&t=media&v=v2&lang=en&cftoken=${token}`;
    const response = await cloudscraper.post({
        uri: `${BASE_URL}/api/ajaxSearch`,
        headers,
        body: formData,
        jar,
        simple: false,
        resolveWithFullResponse: true,
    });

    if (response.statusCode !== 200) {
        throw new Error(`Ajax request failed with status ${response.statusCode}`);
    }

    const data = JSON.parse(response.body);
    if (data.status !== 'ok') {
        throw new Error('Search failed: ' + (data.message || 'Unknown error'));
    }
    return data.data;
}

/**
 * Menjalankan kode obfuscated di sandbox dan mengekstrak link download video & thumbnail
 */
function extractDownloadLinks(obfuscatedCode) {
    let capturedOutput = '';
    let result;

    const sandbox = {
        console: { log: (...args) => { capturedOutput += args.join(' ') + '\n'; } },
        document: {
            write: (html) => { capturedOutput += html; },
            writeln: (html) => { capturedOutput += html + '\n'; },
            location: { hostname: 'snapinsta.to', href: 'https://snapinsta.to/en2' },
            getElementById: () => ({ innerHTML: '' }),
            createElement: () => ({}),
            body: { appendChild: () => { } }
        },
        window: {
            location: { hostname: 'snapinsta.to', href: 'https://snapinsta.to/en2' },
            document: { location: { hostname: 'snapinsta.to' } },
            addEventListener: () => { },
            removeEventListener: () => { }
        },
        location: { hostname: 'snapinsta.to' },
        navigator: { userAgent: 'Mozilla/5.0' },
        decodeURIComponent: (str) => decodeURIComponent(str),
        String: { fromCharCode: (...codes) => String.fromCharCode(...codes) },
        eval: function (code) {
            return vm.runInNewContext(code, sandbox);
        }
    };

    try {
        result = vm.runInNewContext(obfuscatedCode, sandbox);
    } catch (err) {
        throw new Error(`Failed to execute obfuscated code: ${err.message}`);
    }

    const finalHtml = capturedOutput || (typeof result === 'string' ? result : '');
    if (!finalHtml) {
        throw new Error('No HTML output generated from obfuscated code');
    }

    // Ekstraksi regex untuk CDN Snapinsta
    const downloadLinkRegex = /href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)"/gi;
    const videoMatches = [...finalHtml.matchAll(downloadLinkRegex)];
    const videos = videoMatches.map(m => m[1]);

    const imageRegex = /<img[^>]+src="(https:\/\/i\.snapcdn\.app\/photo\?token=[^"]+)"/gi;
    const imageMatches = [...finalHtml.matchAll(imageRegex)];
    const images = imageMatches.map(m => m[1]);

    return {
        videos: [...new Set(videos)],
        images: [...new Set(images)]
    };
}

/**
 * Fungsi utama untuk mengambil link download dari Instagram
 * @param {string} instagramUrl - URL Instagram (Reel, Post, TV, dll)
 * @returns {Promise<{videos: string[], images: string[]}>}
 */
async function scrapeInstagram(instagramUrl) {
    // Inisialisasi jar cookie secara lokal agar tidak terjadi session collision antar request user
    const jar = new cloudscraper.jar(); 
    
    const token = await getToken(instagramUrl, jar);
    const obfuscated = await getObfuscatedData(instagramUrl, token, jar);
    const result = extractDownloadLinks(obfuscated);
    
    return result;
}

module.exports = { scrapeInstagram };