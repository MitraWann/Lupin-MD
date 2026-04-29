const axios = require('axios');

/**
 * Scraper TikTok Stalk
 * Dirancang dengan teknik Header Spoofing untuk bypass WAF/Cloudflare
 * Menggunakan target endpoint Claptik + Fallback Seamless ke TikWM
 */
async function tiktokStalk(username) {
    // Membersihkan input jika user menggunakan format '@username'
    username = username.replace(/^@/, '');
    
    try {
        // =================================================================
        // PERCOBAAN 1: MENGGUNAKAN TARGET ENDPOINT (CLAPTIK.COM)
        // =================================================================
        const params = new URLSearchParams();
        // Asumsi payload umum untuk ajax scraper TikTok pada WordPress
        params.append('action', 'get_user_info'); 
        params.append('username', username);

        const claptikRes = await axios.post('https://claptik.com/wp-admin/admin-ajax.php', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': 'https://claptik.com/',
                'Origin': 'https://claptik.com',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                // Client hints untuk meyakinkan sistem anti-bot
                'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty'
            },
            timeout: 10000 // Set timeout 10 detik agar fallback cepat tereksekusi jika gagal
        });

        // Validasi response sukses dari Claptik
        if (claptikRes.data && claptikRes.data.success && claptikRes.data.data) {
            return claptikRes.data;
        }
        
        throw new Error('Claptik mengembalikan response null atau action salah.');
    } catch (error) {
        // =================================================================
        // PERCOBAAN 2: FALLBACK API (TIKWM)
        // Dijalankan secara otomatis (silent) jika Claptik down/WAF blocked
        // =================================================================
        console.log(`[TikTok Stalk] Beralih ke fallback API karena Claptik gagal...`);
        
        try {
            const fallbackRes = await axios.post('https://www.tikwm.com/api/user/info', 
                new URLSearchParams({ unique_id: username }), 
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/javascript, */*; q=0.01',
                    }
                }
            );
            
            if (fallbackRes.data && fallbackRes.data.data) {
                // Format ulang respons Fallback agar konsisten dengan payload Claptik
                return {
                    success: true,
                    data: fallbackRes.data.data
                };
            }
            throw new Error('User tidak ditemukan atau private.');
        } catch (err) {
            throw new Error('Gagal mengambil data dari server. Pastikan username valid.');
        }
    }
}

module.exports = { tiktokStalk };