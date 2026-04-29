/**
 * TULIPNEX ASSET WIKI & LORE (REWORKED LORE)
 * Location: ./plugins/trading-iteminfo.js
 * Feature: Menampilkan deskripsi, lore, spesifikasi fundamental, dan opsi 'ALL'
 * Developer Note: Lore dirombak total menjadi Hard Sci-Fi Cyber-Botanical.
 */

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    // 1. Database Latar Belakang & Spesifikasi Aset (Cyber-Botanical Lore V2)
    const assetLore = {
        IVL: {
            name: 'IvyLink (Bio-Mesh Network)',
            desc: 'IvyLink adalah sulur serat optik bio-luminescent yang hidup. Aset ini digunakan sebagai infrastruktur dasar untuk melakukan terraforming pada data center usang. Merambat dan memperkuat sinyal antar server tanpa butuh listrik tambahan. Karena sifatnya yang esensial dan murah, IVL sangat cocok untuk trader pemula yang mencari stabilitas.',
            tech: 'Organic Fiber-Optic Mesh',
            min: 2, max: 99999, vol: '3% per siklus',
            tax: '1.5%'
        },
        LBT: {
            name: 'LilyBit (Cryptographic Pollen)',
            desc: 'LilyBit bukan sekadar koin, melainkan \'serbuk sari digital\' yang bereplikasi secara otomatis di dalam dompet DeFi. Digunakan untuk transaksi mikro berkecepatan cahaya oleh warga metropolis. Ketahanannya terhadap anomali jaringan membuat LBT menjadi aset favorit bagi para pedagang harian (day-traders) dan swarm-AI.',
            tech: 'Self-Replicating Pollen Ledger',
            min: 100000, max: 999999, vol: '5% per siklus',
            tax: '1.5%'
        },
        IRC: {
            name: 'IrisCode (Sentient Biometrics)',
            desc: 'Perangkat lunak pengawasan kuantum yang mekar seperti kelopak mata. IrisCode adalah sistem keamanan level militer yang memindai niat (intent-scanning) melalui gelombang otak sebelum transaksi terjadi. Harganya sangat bergantung pada kontrak pertahanan galaksi dan rumor kebocoran intelijen.',
            tech: 'Quantum Intent-Scanner',
            min: 1000000, max: 9999999, vol: '10% per siklus',
            tax: '1.5%'
        },
        LTN: {
            name: 'LotusNet (Orbital Stratosphere Cloud)',
            desc: 'Stasiun komputasi raksasa berbentuk teratai yang mengorbit di stratosfer. LotusNet mendinginkan server intinya menggunakan suhu luar angkasa. Aset ini adalah tulang punggung dari seluruh realitas virtual (Metaverse). Pergerakan harganya dipengaruhi oleh badai matahari, puing luar angkasa, dan ekspansi dunia virtual.',
            tech: 'Stratospheric Cloud Cluster',
            min: 10000000, max: 99999999, vol: '15% per siklus',
            tax: '1.5%'
        },
        RSX: {
            name: 'RoseX (Genetic Luxury Pheromone)',
            desc: 'Komoditas rekayasa genetika paling elit di ekosistem Nexus. RoseX memancarkan feromon digital yang dapat mengubah mood pengguna avatar di Metaverse. Hanya dimiliki oleh kaum sosialita siber dan selebritas hologram. Harganya berfluktuasi secara liar berdasarkan tren fashion, skandal elit, dan pajak kemewahan.',
            tech: 'Neuro-Digital Pheromones',
            min: 100000000, max: 999999999, vol: '20% per siklus',
            tax: '1.5%'
        },
        TNX: {
            name: 'TulipNex (The Singularity Seed)',
            desc: 'Mahkota dari segala penciptaan algoritma. TulipNex adalah benih singularitas AI yang mengatur hukum fisika di dalam jaringan. Memegang TNX berarti memegang otoritas atas dewan direksi ekonomi galaksi. Volatilitasnya ekstrem; ia bisa meruntuhkan bursa atau menciptakan triliuner baru dalam hitungan menit.',
            tech: 'Botanical A.I Singularity',
            min: 1000000000, max: 10000000000, vol: '25% per siklus',
            tax: '2.5% (Luxury Tax)'
        }
    };

    // 2. Ambil Harga Saat Ini (Jika Trading Aktif)
    let currentPrices = {};
    if (global.db.data.settings && global.db.data.settings.trading && global.db.data.settings.trading.prices) {
        currentPrices = global.db.data.settings.trading.prices;
    }

    let ticker = (args[0] || '').toUpperCase();

    // 3. FITUR: Jika pengguna mengetik 'ALL'
    if (ticker === 'ALL') {
        await m.reply(global.wait || '⏳ _Mengunduh data fundamental dari Nexus..._');
        let allTxt = `📚 *TULIPNEX NEXUS ARCHIVE*\n`;
        allTxt += `──────────────────\n`;
        
        for (let t in assetLore) {
            let asset = assetLore[t];
            let priceNow = currentPrices[t] ? `Rp ${currentPrices[t].toLocaleString('id-ID')}` : `Rp ${asset.min.toLocaleString('id-ID')} (Offline)`;
            
            allTxt += `🧬 *${t} - ${asset.name}*\n`;
            allTxt += `💰 *Live Valuasi:* ${priceNow}\n`;
            allTxt += `📜 *Lore:* _${asset.desc}_\n`;
            allTxt += `⚙️ *Infrastruktur:* ${asset.tech}\n`;
            allTxt += `📈 *Volatilitas:* ${asset.vol}\n`;
            allTxt += `🧾 *Pajak Bursa:* ${asset.tax}\n`;
            allTxt += `──────────────────\n`;
        }
        
        allTxt += `💡 _"Pahami teknologi di balik aset sebelum Anda mempertaruhkan kredit Anda."_`;
        return m.reply(allTxt);
    }

    // 4. Jika kosong atau tidak valid (Kirim Daftar Aset)
    if (!ticker || !assetLore[ticker]) {
        let listTxt = `📖 *TULIPNEX ASSET WIKI*\n`;
        listTxt += `──────────────────\n`;
        listTxt += `Ketik *${usedPrefix}${command} <ticker>* untuk membaca enkripsi aset.\n`;
        listTxt += `Ketik *${usedPrefix}${command} all* untuk melihat seluruh arsip fundamental.\n\n`;
        listTxt += `*Indeks Ticker Tersedia:*\n`;
        
        for (let t in assetLore) {
            listTxt += `• *${t}* (${assetLore[t].name})\n`;
        }
        
        listTxt += `──────────────────\n`;
        listTxt += `💡 *Contoh Command:* ${usedPrefix}${command} TNX`;
        
        return m.reply(listTxt);
    }

    // 5. Tampilkan Detail 1 Aset Spesifik
    let asset = assetLore[ticker];
    let priceNow = currentPrices[ticker] ? `Rp ${currentPrices[ticker].toLocaleString('id-ID')}` : 'Rp ' + asset.min.toLocaleString('id-ID') + ' (Offline)';

    let detailTxt = `🧬 *DECRYPTING ASSET: ${ticker}*\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `🏷️ *Nomenklatur:* ${asset.name}\n`;
    detailTxt += `💰 *Live Valuasi:* ${priceNow}\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `📜 *Data Latar Belakang:*\n_${asset.desc}_\n\n`;
    detailTxt += `⚙️ *Spesifikasi Sistem:*\n`;
    detailTxt += `- *Teknologi:* ${asset.tech}\n`;
    detailTxt += `- *Volatilitas:* ${asset.vol}\n`;
    detailTxt += `- *Pajak Jual:* ${asset.tax}\n`;
    detailTxt += `──────────────────\n`;
    detailTxt += `💡 _Analisis fundamental disarankan sebelum eksekusi pembelian._`;

    return m.reply(detailTxt);
}

handler.help = ['deskripsi <ticker/all>']
handler.tags = ['tulipnex']
handler.command = /^(tick|desk|ticker|deskripsi|fundamental|lore)$/i
handler.rpg = true

module.exports = handler;