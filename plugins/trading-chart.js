/**
 * TULIPNEX VISUAL CHART
 * Location: ./plugins/trading-chart.js
 * Feature: Generate gambar grafik pergerakan harga (Logarithmic & Linear)
 * [UPDATE]: Sumbu X sekarang menggunakan format HH:mm real-time (WITA)
 */

const moment = require('moment-timezone');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Cek database trading
    global.db.data.settings = global.db.data.settings || {};
    if (!global.db.data.settings.trading) return m.reply('[!] Sistem TulipNex belum aktif.');
    
    let market = global.db.data.settings.trading;
    if (!market.history) return m.reply('[!] Belum ada data riwayat harga. Tunggu beberapa menit hingga engine mencatat data.');

    let ticker = (args[0] || 'ALL').toUpperCase();

    // 2. Definisi Warna Unik untuk Setiap Aset
    const colors = {
        IVL: 'rgb(255, 99, 132)',   // Merah Muda
        LBT: 'rgb(54, 162, 235)',   // Biru
        IRC: 'rgb(255, 206, 86)',   // Kuning
        LTN: 'rgb(75, 192, 192)',   // Tosca
        RSX: 'rgb(153, 102, 255)',  // Ungu
        TNX: 'rgb(255, 159, 64)'    // Oranye
    };

    let datasets = [];
    let isLogarithmic = false;

    // 3. Konfigurasi Dataset Berdasarkan Input User
    if (ticker === 'ALL') {
        isLogarithmic = true; // Gunakan skala logaritmik karena gap harga (Ribuan vs Miliaran) sangat jauh
        
        for (let t in market.history) {
            datasets.push({
                label: t,
                data: market.history[t],
                borderColor: colors[t] || 'rgb(0,0,0)',
                fill: false,
                tension: 0.3, // Membuat garis sedikit melengkung (smooth)
                borderWidth: 2
            });
        }
    } else {
        // Jika user hanya meminta grafik 1 koin (contoh: .grafik TNX)
        if (!market.history[ticker]) return m.reply(`[!] Ticker *${ticker}* tidak ditemukan di database.`);
        
        datasets.push({
            label: ticker,
            data: market.history[ticker],
            borderColor: colors[ticker] || 'rgb(75, 192, 192)',
            backgroundColor: (colors[ticker] || 'rgb(75, 192, 192)').replace('rgb', 'rgba').replace(')', ', 0.2)'),
            fill: true, // Berikan warna di bawah garis
            tension: 0.3,
            borderWidth: 3
        });
    }

    // 4. Hitung Label Sumbu X (Waktu Riwayat HH:mm WITA)
    let maxLen = 0;
    for (let d of datasets) {
        if (d.data.length > maxLen) maxLen = d.data.length;
    }

    let labels = [];
    let nowTz = moment().tz('Asia/Makassar'); // Ambil waktu WITA saat ini
    
    // Looping mundur untuk mencetak waktu: Jika data maxLen = 10, maka array ke-0 adalah (sekarang - 9 menit)
    for (let i = maxLen - 1; i >= 0; i--) {
        let pastTime = moment(nowTz).subtract(i, 'minutes').format('HH:mm');
        labels.push(pastTime);
    }

    // 5. Susun Konfigurasi Chart.js
    let chartConfig = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            title: {
                display: true,
                text: ticker === 'ALL' ? 'TULIPNEX MARKET (Logarithmic)' : `PERGERAKAN HARGA: ${ticker}`,
                fontSize: 16
            },
            legend: {
                position: 'bottom'
            },
            scales: {
                yAxes: [{
                    type: isLogarithmic ? 'logarithmic' : 'linear',
                    ticks: {
                        beginAtZero: false,
                        // Jika bukan logaritmik, tambahkan Rp di label y-axis
                        callback: `function(value) { return 'Rp ' + value.toLocaleString(); }`
                    }
                }],
                xAxes: [{
                    gridLines: { display: false } // Bersihkan garis vertikal agar lebih rapi
                }]
            }
        }
    };

    // 6. Encode Konfigurasi menjadi URL QuickChart
    let chartJson = JSON.stringify(chartConfig);
    // Hapus kutipan (string) di sekitar fungsi callback agar dirender sebagai fungsi oleh QuickChart
    chartJson = chartJson.replace(/"function\(value\).*?}"/, chartConfig.options.scales.yAxes[0].ticks.callback);
    
    let encodedChart = encodeURIComponent(chartJson);
    let chartUrl = `https://quickchart.io/chart?c=${encodedChart}&w=600&h=400&bkg=white&format=jpg`;

    // 7. Kirim Gambar ke User
    let caption = `📊 *GRAFIK PASAR: ${ticker}*\n`;
    caption += `──────────────────\n`;
    caption += `Visualisasi pergerakan harga selama ${maxLen} menit terakhir.\n\n`;
    if (ticker === 'ALL') {
        caption += `*Catatan:* \n> _${command} 'ALL' menggunakan skala Logaritmik agar aset murah (IVL) dan aset mahal (TNX) bisa tampil berdampingan tanpa garisnya menjadi rata._\n\n`;
    }
    caption += `──────────────────\n`;
    caption += `Ketik *${usedPrefix}${command} <ticker>* untuk fokus melihat satu aset.`;

    // Kirim pesan "Tunggu sebentar..."
    await m.reply('⏳ _Menggambar grafik pergerakan harga, mohon tunggu..._');

    // Kirim Gambar
    return conn.sendFile(m.chat, chartUrl, 'tulipnex-chart.jpg', caption, m);
}

handler.help = ['grafik <ticker/all>']
handler.tags = ['tulipnex']
handler.command = /^(grafik|chart)$/i
handler.rpg = true
handler.group = true
handler.limit = true

module.exports = handler;