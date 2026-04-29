const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Peringatan jika kode koin kosong
    if (!text) {
        return m.reply(
            `⚠️ *Format Salah!*\n\n` +
            `Masukkan kode crypto yang ingin dipantau.\n\n` +
            `*Contoh Penggunaan:*\n` +
            `> ${usedPrefix + command} btc\n` +
            `> ${usedPrefix + command} eth\n` +
            `> ${usedPrefix + command} sol`
        )
    }

    // 2. Format kode koin (Otomatis menambahkan pair USDT jika belum ada)
    let coin = text.toUpperCase().trim().split(' ')[0]
    let symbol = coin.endsWith('USDT') ? coin : `${coin}USDT`

    try {
        // Memberikan reaksi koin saat loading
        //await conn.sendMessage(m.chat, { react: { text: '🪙', key: m.key } })

        // 3. Mengambil data super cepat dari Binance API (100% Real-time)
        let { data } = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)

        // 4. Ekstraksi dan formatting angka
        let currentPrice = parseFloat(data.lastPrice)
        let priceChange = parseFloat(data.priceChange)
        let percentChange = parseFloat(data.priceChangePercent)
        let high24h = parseFloat(data.highPrice)
        let low24h = parseFloat(data.lowPrice)
        let volume = parseFloat(data.volume)

        // Indikator visual
        let icon = priceChange > 0 ? '↗️' : priceChange < 0 ? '↘️' : '➡️'
        let trend = priceChange > 0 ? 'NAIK' : priceChange < 0 ? 'TURUN' : 'STAGNAN'

        // Format angka desimal agar rapi (maksimal 6 angka di belakang koma untuk koin micin)
        let formatPrice = (price) => price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

        // 5. Merakit Antarmuka
        let teks = `🪙 *PANTAUAN CRYPTO REAL-TIME* 🪙\n\n` +
                   `> 💎 *Koin:* \`${symbol}\`\n` +
                   `> 💵 *Harga:* $${formatPrice(currentPrice)}\n` +
                   `> 📊 *Perubahan (24j):* ${icon} $${formatPrice(Math.abs(priceChange))} (${percentChange.toFixed(2)}%)\n` +
                   `> 📈 *High (24j):* $${formatPrice(high24h)}\n` +
                   `> 📉 *Low (24j):* $${formatPrice(low24h)}\n` +
                   `> 🔄 *Volume:* ${volume.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${coin.replace('USDT', '')}\n` +
                   `> 🚦 *Tren Pasar:* ${trend}\n\n` +
                   `_Sistem sinkronisasi: Binance API (Real-time)_`

        await m.reply(teks)

    } catch (e) {
        console.error(e)
        // Menangani error jika koin tidak ada di Binance
        m.reply(`❌ *Gagal mengambil data!*\n\nKoin *\`${coin}\`* tidak ditemukan di market Binance. Pastikan memasukkan kode valid (contoh: BTC, DOGE, PEPE).`)
    }
}

handler.help = ['crypto <koin>']
handler.tags = ['internet']
handler.command = /^(crypto|kripto|coin|koin)$/i

module.exports = handler