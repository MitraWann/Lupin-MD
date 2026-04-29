const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Peringatan jika kode saham kosong
    if (!text) {
        return m.reply(
            `⚠️ *Format Salah!*\n\n` +
            `Masukkan 4 huruf kode saham BEI yang ingin dipantau.\n\n` +
            `*Contoh Penggunaan:*\n` +
            `> ${usedPrefix + command} ADRO\n` +
            `> ${usedPrefix + command} PTBA\n` +
            `> ${usedPrefix + command} INCO`
        )
    }

    // 2. Format kode saham agar sesuai dengan API (BEI menggunakan akhiran .JK)
    let kodeSaham = text.toUpperCase().trim().split(' ')[0]
    let ticker = kodeSaham.endsWith('.JK') ? kodeSaham : `${kodeSaham}.JK`

    try {
        // Memberikan reaksi loading agar terlihat elegan
        await conn.sendMessage(m.chat, { react: { text: '📈', key: m.key } })

        // 3. Mengambil data dari Endpoint API Publik
        let { data } = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`)
        
        if (!data.chart.result) throw new Error('Data kosong')

        // 4. Mengekstrak data krusial
        let meta = data.chart.result[0].meta
        let currentPrice = meta.regularMarketPrice
        let prevClose = meta.chartPreviousClose
        
        // Kalkulasi kenaikan/penurunan
        let change = currentPrice - prevClose
        let percentChange = (change / prevClose) * 100

        // Menentukan ikon dan status tren
        let icon = change > 0 ? '🟢' : change < 0 ? '🔴' : '⚪'
        let trend = change > 0 ? 'NAIK' : change < 0 ? 'TURUN' : 'STAGNAN'

        // 5. Merakit Antarmuka Laporan Saham
        let teks = `📈 *PANTAUAN SAHAM BEI* 📉\n\n` +
                   `> 🏢 *Kode Saham:* \`${kodeSaham}\`\n` +
                   `> 💰 *Harga Terkini:* Rp ${currentPrice.toLocaleString('id-ID')}\n` +
                   `> 📊 *Perubahan:* ${icon} Rp ${Math.abs(change).toFixed(2)} (${percentChange.toFixed(2)}%)\n` +
                   `> 📉 *Prev. Close:* Rp ${prevClose.toLocaleString('id-ID')}\n` +
                   `> 🚦 *Tren Pasar:* ${trend}\n\n` +
                   `_Sistem sinkronisasi: Yahoo Finance (Delay ±10-15 Menit)_`

        await m.reply(teks)

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Gagal mengambil data!*\n\nSaham dengan kode *\`${kodeSaham}\`* tidak ditemukan di bursa atau server sedang sibuk. Pastikan memasukkan 4 digit huruf kode yang valid (contoh: ANTM).`)
    }
}

handler.help = ['saham <kode>']
handler.tags = ['internet']
handler.command = /^(saham|ceksaham|idx)$/i

module.exports = handler