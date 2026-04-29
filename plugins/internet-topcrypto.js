const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Menentukan batas jumlah koin
    let limit = 5 
    
    if (text) {
        let parsed = parseInt(text.trim())
        if (!isNaN(parsed) && parsed > 0) {
            limit = parsed > 20 ? 20 : parsed 
        }
    }

    // 2. Mendeteksi command spesifik yang digunakan user
    let isGainerOnly = /^gainer$/i.test(command)
    let isLoserOnly = /^loser$/i.test(command)
    let showBoth = !isGainerOnly && !isLoserOnly // Berlaku untuk .market, .topcrypto, dll

    try {
        //await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } })

        let { data } = await axios.get('https://api.binance.com/api/v3/ticker/24hr')

        let usdtPairs = data.filter(coin => coin.symbol.endsWith('USDT') && parseFloat(coin.lastPrice) > 0)
        usdtPairs.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))

        let topGainers = usdtPairs.slice(0, limit)
        let topLosers = usdtPairs.slice(-limit).reverse() 

        let formatPrice = (price) => parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

        // 3. Merakit Antarmuka Secara Dinamis Berdasarkan Command
        let teks = `🚀 *CRYPTO MARKET MOVERS* 🚀\n\n`
        
        // Blok Gainer: Tampil jika command .gainer ATAU .market/.topcrypto
        if (showBoth || isGainerOnly) {
            teks += `📈 *TOP ${limit} GAINERS (24H)*\n`
            topGainers.forEach((coin, i) => {
                let symbol = coin.symbol.replace('USDT', '')
                let price = formatPrice(coin.lastPrice)
                let percent = parseFloat(coin.priceChangePercent).toFixed(2)
                teks += `> *${i + 1}. ${symbol}* : $${price} (↗️ +${percent}%)\n`
            })
            if (showBoth) teks += `\n` // Memberikan jarak jika keduanya ditampilkan
        }

        // Blok Loser: Tampil jika command .loser ATAU .market/.topcrypto
        if (showBoth || isLoserOnly) {
            teks += `📉 *TOP ${limit} LOSERS (24H)*\n`
            topLosers.forEach((coin, i) => {
                let symbol = coin.symbol.replace('USDT', '')
                let price = formatPrice(coin.lastPrice)
                let percent = parseFloat(coin.priceChangePercent).toFixed(2)
                teks += `> *${i + 1}. ${symbol}* : $${price} (↘️ ${percent}%)\n`
            })
        }

        teks += `\n_Sistem sinkronisasi: Binance API (Real-time)_`

        await m.reply(teks)

    } catch (e) {
        console.error(e)
        m.reply(`❌ *Gagal mengambil data pasar!*\n\nServer Binance mungkin sedang sibuk atau menolak permintaan. Silakan coba beberapa saat lagi.`)
    }
}

handler.help = ['topcrypto <jumlah>', 'gainer <jumlah>', 'loser <jumlah>']
handler.tags = ['internet'] 
handler.command = /^(topcrypto|topkripto|gainer|loser|market)$/i

module.exports = handler