/**
 * TULIPNEX MARKET EVENTS DATABASE (REWORKED SCI-FI LORE - ANALYTICAL EDITION)
 * Path: ./lib/trading-events.js
 * Description: Ratusan skenario ekonomi & anomali teknologi yang sinkron dengan iteminfo V2.
 * Total: 100 Events (10 Global + 15 IVL + 15 LBT + 15 IRC + 15 LTN + 15 RSX + 15 TNX)
 */

const eventPool = [
    // =========================================================================
    // 🌍 TIER 0: GLOBAL EVENTS (10 Events) - Memengaruhi Seluruh Market
    // =========================================================================
    { 
        title: 'NEXUS BLACKOUT', 
        msg: 'Badai elektromagnetik kelas X dari konstelasi tetangga baru saja menghantam grid komunikasi utama Sektor Alpha. Laporan awal menunjukkan gangguan sinkronisasi sementara pada puluhan node validator, menyebabkan antrean transaksi yang mengkhawatirkan di seluruh sistem.\n\nKepanikan mulai melanda bursa sekunder karena delay penyelesaian transaksi memicu bot arbitrase untuk menghentikan operasinya secara otomatis. Hal ini mengakibatkan likuiditas pasar mendadak menipis secara drastis dalam hitungan menit.\n\nMeskipun sistem fail-safe cadangan dijadwalkan aktif sesaat lagi, ketidakpastian memicu aksi jual panik jangka pendek. Analis menyarankan para trader untuk mengamati book order dengan saksama dan menghindari order pasar.', 
        type: 'bear', ticker: 'GLOBAL', mult: -4.0, dur: 15 
    },
    { 
        title: 'FEDERATION STIMULUS', 
        msg: 'Federasi Galaksi baru saja mengumumkan paket injeksi likuiditas kuantum senilai triliunan kredit untuk merangsang ekonomi sektor digital. Kebijakan ini diambil setelah berbulan-bulan pasar mengalami stagnasi yang membuat investor institusional menahan modal mereka.\n\nAliran dana segar ini memicu sentimen "risk-on" secara instan di kalangan investor ritel dan manajer aset raksasa. Algoritma pembelian besar-besaran mulai memindai aset-aset berisiko tinggi untuk mengakumulasi posisi.\n\nSecara historis, stimulus semacam ini akan mengangkat seluruh valuasi aset kripto botani selama beberapa siklus perdagangan ke depan. Trader harus bersiap menghadapi volatilitas positif yang tajam.', 
        type: 'bull', ticker: 'GLOBAL', mult: 3.5, dur: 18 
    },
    { 
        title: 'AI SINGULARITY LEAK', 
        msg: 'Sebuah model Kecerdasan Buatan tier-9 milik entitas tak dikenal secara tidak sengaja mendistribusikan proyeksi pergerakan pasar ke saluran publik. Proyeksi tersebut menunjukkan probabilitas 92% terjadinya lonjakan adopsi teknologi di semua sektor ekonomi.\n\nMeski keaslian data tersebut masih diverifikasi oleh Dewan Keamanan Data, gelombang FOMO (Fear of Missing Out) tidak dapat dihindari. Jutaan trader ritel mulai memasang posisi beli agresif secara bersamaan.\n\nFenomena ini sering kali menciptakan gelembung harga (price bubble) jangka pendek. Para analis memperingatkan bahwa koreksi mungkin terjadi segera setelah euforia mereda, namun momentum saat ini sangat dikuasai oleh pembeli.', 
        type: 'bull', ticker: 'GLOBAL', mult: 4.0, dur: 10 
    },
    { 
        title: 'CYBER-WARFARE RUMOR', 
        msg: 'Sinyal intelijen mendeteksi pergerakan anomali dari faksi peretas \'Void Syndicate\' yang menargetkan node utama perbankan lintas-planet. Berita ini bocor ke media mainstream dan menciptakan ketakutan akan terjadinya pencurian aset massal.\n\nRespons pasar sangat cepat dan brutal; para investor institusi ("whales") secara serentak memindahkan dana mereka ke dompet dingin (cold storage), menarik likuiditas besar dari buku pesanan bursa. \n\nLangkah de-risking massal ini menjatuhkan harga sebagian besar aset secara tajam. Trader yang jeli mungkin melihat ini sebagai peluang beli di harga diskon, asalkan serangan tersebut terbukti hanya sekadar rumor belaka.', 
        type: 'bear', ticker: 'GLOBAL', mult: -5.0, dur: 12 
    },
    { 
        title: 'TECH-UTOPIA ACCORD', 
        msg: 'Perjanjian damai historis antara dua faksi teknologi dominan akhirnya ditandatangani. Kesepakatan ini membuka jalan bagi interoperabilitas antar-jaringan dan menurunkan biaya transfer aset secara radikal.\n\nPenghapusan "pajak friksi" ini memicu euforia di pasar valuta digital. Model valuasi yang sebelumnya pesimis kini direvisi ke atas secara drastis oleh lembaga pemeringkat kredit utama.\n\nLedakan volume transaksi mengindikasikan bahwa para pelaku pasar sedang melakukan repricing terhadap seluruh kelas aset. Tren naik (uptrend) kemungkinan besar akan menguasai indikator teknikal untuk periode waktu yang cukup lama.', 
        type: 'bull', ticker: 'GLOBAL', mult: 2.8, dur: 20 
    },
    { 
        title: 'HYPER-INFLATION BUG', 
        msg: 'Pemantau jaringan mendeteksi sebuah celah "bug" pada algoritma pencetakan kredit sintetis yang menyebabkan suplai uang bertambah 5% lebih banyak dari yang seharusnya dalam satu jam terakhir.\n\nKetakutan akan terjadinya hiper-inflasi tak terduga membuat nilai beli kredit merosot. Pelaku pasar dengan cepat membuang aset-aset berisiko tinggi untuk mencari perlindungan pada komoditas fisik.\n\nDeveloper inti mengonfirmasi bahwa mereka sedang menggulirkan patch darurat (hotfix) untuk mengatasi bug tersebut. Dampak penurunan harga diperkirakan hanya terjadi sampai perbaikan jaringan berhasil dikonfirmasi secara on-chain.', 
        type: 'bear', ticker: 'GLOBAL', mult: -3.0, dur: 8 
    },
    { 
        title: 'UNIVERSAL BASIC INCOME', 
        msg: 'Pemerintah siber sentral resmi mencairkan program Kredit Universal bulanan kepada miliaran warga digital di sektor bawah. Injeksi dana ini secara langsung mengalir ke dompet ritel masyarakat luas.\n\nSebagian besar penerima dana terpantau menggunakan kredit tersebut untuk berspekulasi di pasar kripto botani dengan harapan melipatgandakan aset mereka. Lonjakan volume pembelian dari akun-akun kecil melonjak tajam.\n\nEfek "dumb money" ini biasanya menciptakan reli harga yang sporadis dan tidak merata. Trader teknikal harus bersiap menavigasi volatilitas ekstrem akibat pergerakan uang yang tidak berbasis pada analisis fundamental.', 
        type: 'bull', ticker: 'GLOBAL', mult: 2.5, dur: 14 
    },
    { 
        title: 'SOLAR FLARE X-CLASS', 
        msg: 'Badai matahari skala besar baru saja menyapu jalur orbit komunikasi yang menghubungkan server utama bursa antar-planet. Akibatnya, latensi jaringan meningkat tajam hingga menembus batas toleransi standar.\n\nKelambatan eksekusi ini menyebabkan slippage yang parah (perbedaan harga eksekusi dengan harga yang diharapkan), memicu bot perdagangan frekuensi tinggi untuk membekukan aktivitas pasar mereka sebagai langkah protektif.\n\nPenarikan likuiditas otomatis ini menyebabkan spread melebar dan harga aset anjlok karena tidak ada yang menahan tekanan jual. Pasar diproyeksikan akan pulih perlahan seiring dengan meredanya efek radiasi pada satelit.', 
        type: 'bear', ticker: 'GLOBAL', mult: -3.5, dur: 9 
    },
    { 
        title: 'QUANTUM DECRYPTION PANIC', 
        msg: 'Sebuah riset akademis terbaru mengklaim bahwa purwarupa komputer kuantum generasi kelima telah berhasil memecahkan lapisan pertama enkripsi bursa Nexus dalam lingkungan simulasi.\n\nMeski belum terjadi pembobolan dana di dunia nyata, judul berita yang sensasional ini menghancurkan tingkat kepercayaan pasar. Para spekulan berlomba-lomba melikuidasi portofolio mereka sebelum aset menjadi tidak berharga.\n\nKrisis kepercayaan ini memicu pola "falling knife" di mana harga jatuh bebas tanpa level support yang jelas. Analis mengimbau trader untuk tidak menangkap pisau jatuh sampai juru bicara keamanan bursa memberikan pernyataan resmi.', 
        type: 'bear', ticker: 'GLOBAL', mult: -4.5, dur: 6 
    },
    { 
        title: 'INTERGALACTIC TRADE PACT', 
        msg: 'Negosiasi maraton terkait Pakta Perdagangan Antar-Galaksi secara mengejutkan mencapai kata sepakat. Regulasi baru ini membuka keran investasi asing dari spesies alien cerdas ke dalam ekosistem Nexus.\n\nAliran dana eksternal yang masif dan belum pernah terjadi sebelumnya ini mengejutkan para pengamat pasar (market maker). Likuiditas yang tadinya terbatas kini dibanjiri oleh pesanan pembelian bernilai fantastis.\n\nKejutan permintaan (demand shock) yang positif ini membuat banyak aset menembus batas resistensi tertinggi sepanjang masanya. Para penganalisis memproyeksikan pergeseran paradigma harga selama euforia investasi asing ini berlangsung.', 
        type: 'bull', ticker: 'GLOBAL', mult: 3.2, dur: 16 
    },

    // =========================================================================
    // 🌱 TIER 1: IVYLINK (IVL) - Bio-Mesh Network (15 Events)
    // =========================================================================
    { 
        title: 'NEO-TERRAFORMING CONTRACT', 
        msg: 'Otoritas Koloni Mars baru saja mengumumkan penandatanganan kontrak sementara yang mewajibkan penggunaan sulur organik IvyLink sebagai infrastruktur tulang punggung komunikasi kluster terraforming.\n\nKabar bahwa IVL diuji coba di lingkungan bertekanan ekstrem seketika menaikkan prestise aset ini. Pesanan masuk dari kontraktor sekunder membanjiri buku pesanan, mendorong harga naik dengan volume yang sangat padat.\n\nTrader yang memantau pergerakan ini menilai bahwa konfirmasi pesanan dari proyek nyata adalah sinyal bullish yang kuat. Momentum ini diperkirakan dapat menembus beberapa level resistensi sekaligus.', 
        type: 'bull', ticker: 'IVL', mult: 1.8, dur: 12 
    },
    { 
        title: 'ROOT ROT MALWARE OUTBREAK', 
        msg: 'Sejumlah laporan awal mendeteksi adanya mutasi malware "Root-Rot" yang menyebar melalui kelembaban udara virtual di sekitar ladang server IVL. Malware ini dilaporkan menggerogoti serat optik biologis dan menurunkan kecepatan data.\n\nKepanikan jangka pendek melanda karena dikhawatirkan biaya perbaikan node akan memotong margin keuntungan validator IVL. Para penambang data mulai membuang hasil farming mereka untuk mencegah kerugian lebih dalam.\n\nPihak pengembang mengonfirmasi sedang membuat antibodi digital untuk menetralkan malware ini. Tekanan jual kemungkinan akan mereda segera setelah distribusi vaksin digital ini mencapai 50% dari total node.', 
        type: 'bear', ticker: 'IVL', mult: -2.0, dur: 8 
    },
    { 
        title: 'BIO-LUMINESCENCE UPGRADE', 
        msg: 'Rilis pembaruan genetika terbaru berhasil membuat jaringan sulur IVL memancarkan cahaya bio-luminescence secara mandiri. Inovasi ini secara mengejutkan memangkas biaya penerangan listrik di data center fisik hingga 30%.\n\nPenghematan biaya operasional (OPEX) yang masif ini langsung menarik perhatian analis fundamental. Evaluasi nilai wajar (fair value) untuk IVL direvisi ke atas, memicu gelombang pembelian dari investor nilai (value investors).\n\nEfisiensi nyata ini menciptakan landasan harga yang solid di pasar. Para pelaku pasar mengantisipasi adanya kelangkaan suplai sekunder karena banyak institusi mulai mengunci aset IVL mereka dalam kontrak jangka panjang.', 
        type: 'bull', ticker: 'IVL', mult: 1.6, dur: 15 
    },
    { 
        title: 'SYNTHETIC PEST INVASION', 
        msg: 'Hama nanobot parasit, yang diyakini bocor dari laboratorium pesaing, terdeteksi mulai memakan lapisan luar serat pelindung IvyLink di sejumlah hub dataran Eropa. Efisiensi transmisi data dilaporkan menurun sesaat.\n\nKecemasan akan potensi sabotase industri memicu keluarnya pemegang modal konservatif dari aset ini. Order book menunjukkan peningkatan drastis pada sisi penawaran (ask/sell) yang menekan harga turun.\n\nMeskipun protokol isolasi darurat telah diaktifkan untuk memutus rantai penyebaran hama, ketakutan psikologis pasar tetap mendominasi pergerakan harga. Analis merekomendasikan trader untuk memantau waktu respons dari pengembang inti.', 
        type: 'bear', ticker: 'IVL', mult: -1.9, dur: 7 
    },
    { 
        title: 'SMART-CITY ADOPTION', 
        msg: 'Tiga aliansi Megalopolis baru saja meloloskan rancangan undang-undang yang mensubsidi penggunaan IVL untuk mengintegrasikan jaringan sistem lalu lintas bawah tanah mereka.\n\nKeputusan politis ini bertindak sebagai katalis utama bagi sentimen pasar. Permintaan seketika meledak melampaui kemampuan petani IVL untuk menghasilkan suplai harian, memicu kejutan harga yang sangat agresif.\n\nLangkah institusional ini membuktikan keandalan IvyLink di tingkat utilitas perkotaan. Pelaku pasar berspekulasi bahwa kota-kota lain mungkin akan segera mengikuti jejak ini, menjaga momentum harga tetap tinggi.', 
        type: 'bull', ticker: 'IVL', mult: 2.0, dur: 14 
    },
    { 
        title: 'OVERGROWTH INCIDENT', 
        msg: 'Terjadi anomali genetika di sektor 4 di mana sulur IVL mengalami percepatan pertumbuhan ekstrem dan tidak terkendali, melilit serta merusak perangkat keras server milik klien bernilai miliaran kredit.\n\nAncaman tuntutan ganti rugi (class-action lawsuit) dari para klien segera menghantui yayasan pengembang IVL. Ketidakpastian legal ini memicu aksi jual instan karena manajer risiko portofolio menekan tombol panik.\n\nTim krisis IVL dilaporkan sedang bernegosiasi untuk menyelesaikan masalah ini di luar pengadilan. Tren penurunan akan mendominasi grafik hingga ada kepastian bahwa denda yang dibayarkan tidak mengancam likuiditas kas proyek.', 
        type: 'bear', ticker: 'IVL', mult: -2.2, dur: 6 
    },
    { 
        title: 'PHOTOSYNTHESIS PATCH', 
        msg: 'Komunitas open-source IVL berhasil menemukan "Photosynthesis Patch", sebuah modifikasi sistem yang memungkinkan sulur bio-fiber mengubah panas buangan dari server menjadi energi cadangan yang dapat dijual kembali.\n\nInovasi revolusioner ini mengubah IvyLink dari sekadar saluran data menjadi entitas penghasil energi. Laporan pendapatan proyektif (yield-forecast) yang beredar di komunitas memicu lonjakan minat beli (buying spree) gila-gilaan.\n\nKehebohan ini secara efektif membersihkan semua pesanan jual (sell wall) di bursa utama. Analis memprediksi bahwa keuntungan ganda (data + energi) akan memosisikan IVL sebagai aset paling dicari minggu ini.', 
        type: 'bull', ticker: 'IVL', mult: 1.7, dur: 10 
    },
    { 
        title: 'ECO-TERRORIST SABOTAGE', 
        msg: 'Fraksi radikal anti-teknologi \'Neo-Luddite\' melancarkan serangan terkoordinasi, secara fisik memotong node akar siber IVL di tiga benua utama secara serentak. Ribuan tera-byte data tertunda di udara.\n\nBerita gambar sabotase yang beredar di media sosial menciptakan "FUD" (Fear, Uncertainty, and Doubt) ekstrem. Trader ritel yang terpengaruh visual mulai menjual aset mereka pada harga pasar tanpa ragu.\n\nTim insinyur menyatakan bahwa rute data telah berhasil dialihkan (rerouted) ke jalur satelit cadangan, namun kerusakan fisik membutuhkan waktu untuk tumbuh kembali. Harga diprediksi akan tertekan oleh sentimen negatif jangka pendek.', 
        type: 'bear', ticker: 'IVL', mult: -2.5, dur: 9 
    },
    { 
        title: 'DEEP-OCEAN CABLE SUCCESS', 
        msg: 'Proyek ambisius IvyLink untuk menyambungkan node sulur bawah laut trans-atlantik dilaporkan sukses 100%. Node ini berhasil bertahan dari tekanan air ekstrem dan menghubungkan Atlantis siber dengan daratan utama.\n\nKeberhasilan ini menghapus keraguan pasar atas ketahanan teknis jaringan IVL. Aliran investasi infrastruktur yang sebelumnya tertahan kini masuk membanjiri likuiditas market maker.\n\nPencapaian teknis raksasa ini memberikan dorongan psikologis yang kuat. Sinyal teknikal berbalik arah tajam dari posisi netral menjadi sangat bullish, menarik perhatian bot perdagangan berorientasi tren (trend-following bots).', 
        type: 'bull', ticker: 'IVL', mult: 2.1, dur: 12 
    },
    { 
        title: 'DROUGHT SIMULATION ERROR', 
        msg: 'Sebuah bug pada sistem pengatur cuaca buatan di dalam server agrikultur menyebabkan simulasi kekeringan berjalan terlalu ekstrem. Hal ini menghambat pasokan nutrisi ke bio-fiber IVL dan menghentikan replikasi node harian.\n\nTurunnya rasio produksi blok data seketika menurunkan hasil persentase keuntungan tahunan (APY) bagi para stakers. Kekecewaan ini terefleksi pada grafik harga yang mulai menunjukkan pola distribusi massif.\n\nMeski pengembang sedang memutar balik sistem cuaca ke setelan default, hilangnya momentum hasil (yield loss) membuat aset ini kehilangan daya tariknya sementara waktu. Pasar diperkirakan akan berdarah perlahan (slow bleed).', 
        type: 'bear', ticker: 'IVL', mult: -1.8, dur: 10 
    },
    { 
        title: 'SYMBIOTIC AI INTEGRATION', 
        msg: 'Kecerdasan Buatan lokal secara mandiri memutuskan untuk bersimbiosis damai dengan jaringan IVL. AI tersebut menggunakan sulur IVL sebagai jaringan sarafnya, melipatgandakan kecepatan bandwidth efisiensi perutean secara instan.\n\nSinergi anomali yang tak terduga ini dianggap sebagai tonggak sejarah baru dalam arsitektur komputasi. Laporan analis sekuritas berlomba-lomba memberikan rating "Strong Buy" untuk IVL.\n\nEuforia sinergi bio-mekanik ini mendorong arus spekulatif yang sangat kuat. Harga bergerak naik secara parabola, memicu short-squeeze di mana para penjual yang salah posisi terpaksa membeli kembali aset di harga tinggi.', 
        type: 'bull', ticker: 'IVL', mult: 2.3, dur: 15 
    },
    { 
        title: 'PARASITIC FUNGI OUTBREAK', 
        msg: 'Sebuah varian jamur siber parasit jenis baru (dijuluki Fungi.exe) terdeteksi menempel dan menguras daya pemrosesan pada lebih dari 400.000 titik server pengguna IVL di lapisan perifer jaringan.\n\nInfeksi yang menurunkan kinerja ini memicu kepanikan pengguna skala perusahaan (enterprise) yang mulai mengevaluasi ulang kontrak berlangganan mereka. Sentimen ini menekan ekspektasi pendapatan IVL di kuartal mendatang.\n\nPergerakan harga merespons dengan penurunan tajam seiring aksi jual (dumping) antisipatif. Situasi tetap bearish hingga tim cybersecurity mampu mendistribusikan patch anti-jamur berskala jaringan.', 
        type: 'bear', ticker: 'IVL', mult: -2.2, dur: 8 
    },
    { 
        title: 'VERTICAL FARMING BOOM', 
        msg: 'Terjadi tren mendadak berupa booming di sektor pertanian vertikal (vertical farming) pintar. Industri ini menyadari bahwa sulur IVL adalah medium transmisi data IoT paling efisien untuk sensor agrikultur.\n\nPermintaan industri yang meledak ini memborong habis semua suplai sirkulasi IVL di pasar spot. Kelangkaan ini memaksa para pembeli institusional untuk melakukan bidding war (perang tawaran) di harga yang semakin tinggi.\n\nLonjakan permintaan nyata seperti ini adalah skenario ideal bagi para banteng (bulls). Analis memperingatkan bahwa harga dapat melonjak secara tidak rasional sebelum mencapai keseimbangan penawaran yang baru.', 
        type: 'bull', ticker: 'IVL', mult: 1.9, dur: 12 
    },
    { 
        title: 'FERTILIZER SHORTAGE', 
        msg: 'Terjadi gangguan besar pada rantai pasok global yang mengakibatkan kelangkaan unsur silikon-nutrisi yang vital bagi pertumbuhan ekspansi jaringan sulur IVL. Proyek-proyek ekspansi terpaksa ditunda secara agresif.\n\nRevisi target pertumbuhan yang diumumkan oleh manajemen langsung disambut negatif oleh bursa. Para trader algoritmik menyesuaikan valuasi aset berdasarkan pertumbuhan metrik yang lebih lambat, memicu aksi jual otomatis.\n\nPenundaan ekspansi dianggap sebagai pelemahan fundamental jangka pendek. Investor yang mencari pertumbuhan cepat kemungkinan akan merotasi dana mereka ke aset lain, membiarkan IVL bergerak turun dengan volume yang melemah.', 
        type: 'bear', ticker: 'IVL', mult: -1.5, dur: 10 
    },
    { 
        title: 'GLOW-IN-THE-DARK TREND VIRAL', 
        msg: 'Seorang selebritas papan atas secara tidak sengaja mempopulerkan penggunaan estetika bio-cahaya sulur IVL sebagai dekorasi apartemen pintar kelas atas. Tren ini mendadak viral di seluruh platform sosial siber.\n\nPermintaan ritel untuk kepentingan non-utilitas (estetika murni) menyedot likuiditas pasar secara mengejutkan. Pembelian massal dari dompet akun kecil memicu kenaikan harga yang stabil dan terus-menerus (steady grind up).\n\nMeskipun kenaikan ini tidak berbasis utilitas teknologi, psikologi kerumunan (herd mentality) sangat kuat dalam mempertahankan momentum reli. Trader harian sangat menikmati volatilitas organik semacam ini.', 
        type: 'bull', ticker: 'IVL', mult: 1.5, dur: 8 
    },

    // =========================================================================
    // 🌼 TIER 2: LILYBIT (LBT) - Cryptographic Pollen (15 Events)
    // =========================================================================
    { 
        title: 'POLLEN RUSH SEASON', 
        msg: 'Siklus musiman "musim semi digital" telah tiba lebih awal dari prediksi algoritma. Tingkat replikasi serbuk sari LBT di seluruh jaringan memicu lonjakan airdrop yang didistribusikan secara acak kepada pemegang aktif.\n\nPengharapan akan mendapatkan dividen serbuk sari gratis memicu gelombang akumulasi yang masif (accumulation rush). Orang-orang berebut membeli LBT demi syarat partisipasi pembagian hasil (yield snapshot).\n\nMekanisme imbalan gamifikasi ini selalu sukses memicu sentimen euforia jangka pendek. Chart menunjukkan pola breakout tajam seiring likuiditas yang terus dipompa masuk oleh partisipan baru.', 
        type: 'bull', ticker: 'LBT', mult: 2.2, dur: 10 
    },
    { 
        title: 'ALLERGIC REACTION GLITCH', 
        msg: 'Pembaruan massal pada salah satu perusahaan firewall antivirus paling populer di dunia salah mengkategorikan serbuk kriptografi LBT sebagai ancaman Trojan. Akibatnya, jutaan transaksi mikro diblokir paksa di tingkat router.\n\nGangguan fungsional ini menghancurkan kecepatan transaksi LBT ke angka nol untuk sebagian besar pengguna ritel. Kepanikan karena aset yang "beku" mendorong trader untuk melakukan aksi jual via saluran OTC atau bursa terpusat.\n\nMeskipun ini murni kesalahan pihak ketiga (antivirus), efek psikologisnya sangat merusak harga jangka pendek. Aksi jual karena rasa takut (panic selling) akan mendominasi hingga pihak antivirus menarik kembali pembaruannya.', 
        type: 'bear', ticker: 'LBT', mult: -2.4, dur: 8 
    },
    { 
        title: 'HIVE MIND SYNCHRONIZATION', 
        msg: 'Sebuah konsorsium Swarm-AI perbankan besar mengumumkan hasil uji coba yang sukses dan memutuskan untuk menggunakan arsitektur lebah mekanik LBT sebagai standar baru penyelesaian transaksi antar-bank.\n\nBerita adopsi institusional tingkat elit ini bertindak sebagai bahan bakar roket bagi harga LBT. Bot-bot arbitrase menghentikan aksi jual mereka dan beralih ke mode akumulasi agresif dalam milidetik.\n\nIntegrasi ke "Hive Mind" ini adalah validasi pamungkas atas keandalan teknologi LilyBit. Pasar memasuki fase penemuan harga baru (price discovery), di mana trader berlomba menentukan batas atas valuasi yang wajar.', 
        type: 'bull', ticker: 'LBT', mult: 2.5, dur: 14 
    },
    { 
        title: 'STALE WIND STAGNATION', 
        msg: 'Fenomena langka yang disebut "Angin Stagnan" oleh para insinyur terjadi ketika entropi data di jaringan inti menurun tajam. Hal ini menghambat penyebaran serbuk sari LBT, mengakibatkan waktu tunggu (block time) melonjak gila-gilaan.\n\nKinerja jaringan yang melambat sangat menjengkelkan para pelaku pasar yang terbiasa dengan kecepatan tinggi. Kekesalan ini berujung pada migrasi modal (capital flight) besar-besaran menuju jaringan pesaing yang lebih lancar.\n\nVolume perdagangan LBT anjlok drastis, dan harga tergelincir di bawah garis support teknikal. Aset ini diproyeksikan terus melemah (downtrend) sampai para penambang berhasil memompa entropi jaringan ke level normal kembali.', 
        type: 'bear', ticker: 'LBT', mult: -1.8, dur: 11 
    },
    { 
        title: 'CROSS-POLLINATION BRIDGE', 
        msg: 'Proyek "Jembatan Penyerbukan Lintas-Rantai" akhirnya aktif. Jembatan (bridge) cerdas ini memungkinkan LBT untuk beroperasi mulus di tiga ekosistem blockchain pesaing raksasa, membuka akses likuiditas miliaran dolar yang sebelumnya terisolasi.\n\nAliran modal masuk (capital inflow) dari pengguna jaringan lain meledak secara eksponensial. Likuiditas yang tadinya terbatas kini dibanjiri oleh modal asing yang ingin mencicipi yield dari LBT.\n\nMomentum cross-chain ini memicu sentimen yang luar biasa kuat. Para trader teknikal melihat pola grafik \'cup-and-handle\' yang terkonfirmasi, menjanjikan kenaikan persentase dua digit selama sesi perdagangan aktif.', 
        type: 'bull', ticker: 'LBT', mult: 2.1, dur: 16 
    },
    { 
        title: 'PESTICIDE PROTOCOL ENACTED', 
        msg: 'Regulator keuangan siber merilis rancangan aturan ketat yang dikenal sebagai "Protokol Pestisida". Aturan ini memerintahkan pemusnahan paksa dompet-dompet bot spammer yang sering memanipulasi serbuk sari LBT.\n\nWalaupun tujuannya untuk membersihkan jaringan dalam jangka panjang, eksekusi pemusnahan dompet ini memicu likuidasi besar-besaran yang tumpah ke bursa (dump). Trader ritel ikut panik dan menjual aset mereka (capitulation).\n\nTurbulensi akibat regulasi ini memaksa LBT memasuki wilayah beruang (bear territory). Kejatuhan harga diprediksi akan terus berlangsung sampai efek kejutan dari "pestisida" ini benar-benar selesai dieksekusi.', 
        type: 'bear', ticker: 'LBT', mult: -2.1, dur: 12 
    },
    { 
        title: 'DEFI BLOOM EXPLOSION', 
        msg: 'Sebuah protokol pinjaman dan peminjaman (lending/borrowing) terdesentralisasi yang dibangun sepenuhnya di atas ekosistem LilyBit mengumumkan rekor baru; Total Value Locked (TVL) mereka melonjak 400% dalam semalam!\n\nPenguncian suplai dalam jumlah masif ini secara matematis menciptakan kejutan kelangkaan (supply shock) di bursa spot. Karena semakin sedikit LBT yang tersedia untuk dijual, pesanan beli kecil pun mampu menggerakkan harga secara agresif.\n\nSiklus pertumbuhan DeFi ini (DeFi Summer) memancing datangnya \'smart money\' yang memburu aset langka berbunga. Pelaku pasar bersiap menyambut tren bullish berhari-hari (multi-day rally) seiring terkuncinya suplai LBT.', 
        type: 'bull', ticker: 'LBT', mult: 1.9, dur: 18 
    },
    { 
        title: 'DIGITAL WASP ATTACK', 
        msg: 'Kawanan malware canggih yang dirancang menyerupai tawon pemangsa (Wasp-Botnet) meretas dan membobol brankas likuiditas agregator yang digunakan oleh para pemegang LBT raksasa (whales). Jutaan serbuk sari berpindah tangan ke dompet peretas.\n\nInformasi bahwa dana curian mulai dijual (dumping) di bursa terdesentralisasi menghancurkan order book. Para investor panik berlomba-lomba menjual aset mereka (front-running) sebelum harga mencapai dasar.\n\nKrisis keamanan ini memberikan hantaman psikologis yang parah. Sampai pengembang berhasil membekukan dompet peretas dan memastikan kerentanan telah ditambal, LBT akan berada di bawah tekanan jual bertubi-tubi.', 
        type: 'bear', ticker: 'LBT', mult: -2.7, dur: 7 
    },
    { 
        title: 'NANO-BEES DEPLOYMENT', 
        msg: 'Yayasan LilyBit mengerahkan armada jutaan "Lebah Nano" berbasis komputasi edge untuk menggantikan protokol verifikasi lama. Pengerahan ini secara ajaib menurunkan biaya gas fee transaksi LBT hingga mendekati nol.\n\nPenghapusan hambatan biaya memicu gelombang masif pembuatan aplikasi mikro dan game siber yang menggunakan LBT sebagai mata uang utamanya. Metrik penggunaan aktif harian meroket memecahkan rekor historis.\n\nMetrik adopsi (on-chain metrics) yang bercahaya hijau pekat ini mengundang masuknya modal ventura tingkat akhir. Para pemburu tren (trend followers) memperkirakan valuasi LBT akan berakselerasi lebih cepat dari rata-rata pasar.', 
        type: 'bull', ticker: 'LBT', mult: 2.4, dur: 15 
    },
    { 
        title: 'POLLUTION INTERFERENCE', 
        msg: 'Anomali polusi sinyal data padat spektrum dilaporkan menghambat algoritma perutean navigasi replikasi serbuk sari LBT. Transaksi dompet ke dompet sering kali tersesat (lost in transit) dan harus diinisiasi ulang secara manual.\n\nKehilangan efisiensi yang menjengkelkan ini menghancurkan reputasi kenyamanan ekosistem LBT. Para trader aktif mulai memboikot aset ini dan menghentikan bot market-making mereka karena takut aset nyangkut di tengah jalan.\n\nKurangnya dukungan likuiditas akibat mundurnya para pembuat pasar menciptakan jurang harga (price gap) yang rentan. Aksi jual kecil sekalipun dapat menjatuhkan harga puluhan persen hingga polusi sinyal dapat dinetralkan.', 
        type: 'bear', ticker: 'LBT', mult: -2.0, dur: 10 
    },
    { 
        title: 'SPRING EQUINOX EVENT', 
        msg: 'Siklus kalender siber telah mencapai titik Ekuinoks Musim Semi. Pada momen sakral yang diprogramkan dalam inti genesis ini, mesin algoritma secara otomatis menggandakan batas imbal hasil farming (yield multiplier) untuk seluruh likuiditas LBT.\n\nInsentif selangit ini memicu "demam emas" seketika. Ratusan juta modal bergegas masuk ke ekosistem, berebut membeli LBT demi memarkirnya ke dalam kontrak pintar dengan return tahunan yang gila-gilaan.\n\nTekanan beli ekstrem (hyper-buying pressure) ini melahap habis semua dinding jual di bursa. Pergerakan parabola seperti ini sering kali mengacaukan analisis indikator tradisional, didorong murni oleh keserakahan (greed).', 
        type: 'bull', ticker: 'LBT', mult: 2.8, dur: 12 
    },
    { 
        title: 'GENETIC DEGRADATION FEAR', 
        msg: 'Audit kode terbaru menemukan indikasi bahwa struktur varian kriptografi LBT generasi V1 mulai menunjukkan keusangan matematis dan berpotensi lapuk (genetic degradation). Pengembang mendesak proses pembakaran (burn) paksa untuk menyelamatkan ekosistem.\n\nMeskipun ini adalah prosedur pemeliharaan, miskomunikasi di media sosial membingkai kejadian ini sebagai "kehancuran koin". Kepanikan ritel memicu eksodus dari kontrak pintar, membongkar likuiditas dan membuang LBT ke pasar.\n\nKebingungan informasi (FUD) adalah musuh utama stabilitas harga. Diperkirakan tekanan jual irasional ini akan mendominasi papan perdagangan sampai pihak developer berhasil menjernihkan misinformasi melalui klarifikasi resmi.', 
        type: 'bear', ticker: 'LBT', mult: -1.9, dur: 9 
    },
    { 
        title: 'RETAIL FOMO IGNITION', 
        msg: 'Sebuah utas panjang yang ditulis oleh tokoh siber anonim yang sangat dihormati mendadak viral di seluruh penjuru forum investasi. Utas tersebut membedah dan memuji habis-habisan arsitektur anti-inflasi serta ketahanan ekosistem LBT.\n\nPengaruh influencer (social proof) ini bertindak sebagai pemantik bensin. Sindrom FOMO menyapu para trader amatir, yang mulai melakukan market buy (hajar kanan) tanpa memperdulikan harga rata-rata atau kehati-hatian teknikal.\n\nGerombolan pembeli eceran ini menciptakan lilin hijau panjang beruntun di grafik perdagangan. Momentum psikologis ini sulit dihentikan dalam jangka pendek, dan LBT kemungkinan akan terus reli hingga kehabisan daya beli.', 
        type: 'bull', ticker: 'LBT', mult: 2.0, dur: 8 
    },
    { 
        title: 'FLASH LOAN EXPLOIT', 
        msg: 'Sebuah peretasan canggih berbasis eksploitasi pinjaman kilat (flash loan attack) berhasil menipu sistem oracle desentralisasi LBT. Hacker tersebut sukses memanipulasi rasio harga dan menyedot jutaan likuiditas dari pasar sekunder.\n\nBerita pencurian masif ini menghancurkan buku pesanan seperti rumah kartu. Algoritma manajemen risiko dari para manajer dana otomatis langsung menutup (dump) posisi LBT mereka untuk mencegah kerugian berlanjut.\n\nKejadian peretasan besar selalu membawa bayang-bayang kehancuran harga jangka pendek. Aset ini akan berada dalam tren pendarahan parah sampai audit keamanan selesai mengevaluasi total kerugian dan menambal eksploitasi tersebut.', 
        type: 'bear', ticker: 'LBT', mult: -3.0, dur: 6 
    },
    { 
        title: 'GREENHOUSE GAS SUBSIDY', 
        msg: 'Kementerian Teknologi Siber mengeluarkan dekrit subsidi "Greenhouse" yang akan mengembalikan (refund) 100% biaya gas transaksi jaringan untuk semua kontrak pintar yang berinteraksi langsung dengan ekosistem LilyBit.\n\nDengan transaksi yang kini pada dasarnya gratis, pengembang game dan dApps bergegas mengintegrasikan LBT ke dalam ekosistem mereka. Antisipasi atas ledakan penggunaan (utility boom) ini memicu aksi borong dari para whales yang bergerak mendahului pasar.\n\nSubsidi pemerintah adalah sinyal fundamental (bullish fundamental) terkuat yang bisa diharapkan oleh sebuah ekosistem pasar. Analis sepakat ini akan menciptakan lantai harga (price floor) yang jauh lebih tinggi secara permanen.', 
        type: 'bull', ticker: 'LBT', mult: 1.8, dur: 18 
    },

    // =========================================================================
    // 👁️ TIER 3: IRISCODE (IRC) - Sentient Biometrics (15 Events)
    // =========================================================================
    { 
        title: 'PENTAGON CONTRACT SECURED', 
        msg: 'Bocornya dokumen rahasia mengonfirmasi bahwa Aliansi Militer Global (Pentagon Cyber-Division) secara resmi memilih sistem biometrik IrisCode sebagai pemindai lapis terakhir untuk peluncuran misil balistik kuantum.\n\nValidasi tingkat keamanan tertinggi di alam semesta ini membuat takjub dunia investasi. Institusi yang sebelumnya ragu karena risiko keamanan kini memborong aset IRC dengan jumlah yang mencengangkan, menelan habis semua tawaran jual (ask).\n\nPenetapan standar militer membuat IRC dipandang tak tersentuh oleh fluktuasi pasar biasa. Lonjakan apresiasi nilai diprediksi akan sangat persisten (persistent uptrend) seiring masuknya uang dari lembaga pertahanan negara.', 
        type: 'bull', ticker: 'IRC', mult: 2.8, dur: 15 
    },
    { 
        title: 'RETINA BREACH SCANDAL', 
        msg: 'Grup peretas legendaris bawah tanah \'BlindFold\' merilis sebuah video bukti di dark web yang mendemonstrasikan cara mereka memanipulasi intent-scanner sentien IRC untuk melewati lapisan verifikasi tingkat menengah.\n\nReputasi IrisCode yang menjanjikan "keamanan tak tertembus" hancur dalam hitungan detik. Kepanikan institusional (institutional panic) melanda karena korporasi khawatir brankas mereka dapat dijebol, memicu aksi pembuangan aset besar-besaran.\n\nSentimen pasar berbalik menjadi sangat beracun (toxic bearish). Grafik harga akan terus menukik menembus beberapa level support hingga pengembang membuktikan bahwa eksploitasi tersebut telah ditambal secara komprehensif.', 
        type: 'bear', ticker: 'IRC', mult: -3.2, dur: 10 
    },
    { 
        title: 'PRE-CRIME SUCCESS STORY', 
        msg: 'Algoritma membaca-niat (intent-reading) dari IRC menjadi tajuk berita utama setelah sukses mendeteksi niat meretas dan membekukan akses para sindikat perampok bank siber sebelum kejahatan itu sendiri sempat terjadi!\n\nKemampuan "Pre-Crime" layaknya fiksi ilmiah ini menjadi alat pemasaran gratis yang brilian. Entitas komersial dan perusahaan asuransi raksasa berbondong-bondong melisensikan modul IRC, meroketkan arus kas proyek secara dramatis.\n\nEkspektasi akan monopoli layanan keamanan prediksi di masa depan membuat pasar menetapkan premi valuasi tinggi pada aset ini. Reli bullish diperkirakan akan sangat kuat dan memakan waktu lama untuk mereda.', 
        type: 'bull', ticker: 'IRC', mult: 2.5, dur: 16 
    },
    { 
        title: 'PRIVACY LAWSUIT FILED', 
        msg: 'Sebuah koalisi kuat aktivis Hak Asasi Manusia (HAM) Siber mengajukan gugatan hukum antar-planet bernilai triliunan terhadap IRC, atas tuduhan berat bahwa sistem sentien mereka mengeksploitasi privasi pikiran penggunanya tanpa izin.\n\nBayang-bayang regulasi dan potensi denda masif yang bisa menghancurkan kas perusahaan membuat para manajer reksadana ketakutan. Mereka mulai mencabut kepemilikan saham dan token IRC secara perlahan namun konsisten.\n\nRisiko hukum struktural selalu dipandang sebagai red-flag utama oleh wall street siber. Meskipun kasus ini akan memakan waktu lama di pengadilan, tekanan (overhang) pesimisme akan menekan harga ke zona merah dalam jangka menengah.', 
        type: 'bear', ticker: 'IRC', mult: -2.6, dur: 14 
    },
    { 
        title: 'NEURAL LINK INTEGRATION RUMOR', 
        msg: 'Rumor yang berkembang kencang di forum-forum eksklusif pialang mengabarkan bahwa teknologi IrisCode akan diintegrasikan langsung sebagai modul otorisasi dasar ke dalam chip implan otak (neural link) manusia generasi berikutnya.\n\nSpekulasi liar ini memancing imajinasi para investor tentang skala monopoli mutlak. Perburuan aset (asset grab) berlangsung agresif karena FOMO akan potensi pasar bernilai ratusan triliun dolar mulai menguasai narasi publik.\n\nMeskipun rumor ini belum dikonfirmasi resmi, kekuatan narasi "Neural Link" cukup untuk menghancurkan dominasi kubu penjual (bears). Kenaikan drastis (vertical rally) diproyeksikan akan mendominasi grafik.', 
        type: 'bull', ticker: 'IRC', mult: 3.0, dur: 12 
    },
    { 
        title: 'BLINDSPOT BUG DISCOVERED', 
        msg: 'Terdeteksi anomali pemrograman aneh yang dijuluki "Blindspot Bug" pada lapisan kelopak optik IRC. Bug ini secara acak menggagalkan proses verifikasi pengguna VIP, mengunci mereka dari akses brankas likuiditas bernilai tinggi di bursa utama.\n\nFrustrasi ekstrem dari kalangan atas (high-net-worth individuals) berujung pada ancaman boikot. Pembuat pasar (market maker) menurunkan likuiditas yang mereka sediakan untuk IRC untuk menghindari risiko terjebak dalam posisi rugi.\n\nKesalahan krusial pada fungsi utama biometrik adalah pukulan telak bagi reputasi. Trader yang cerdas memanfaatkan pantulan-pantulan kecil (dead cat bounce) untuk melakukan short selling saat harga perlahan-lahan merosot turun.', 
        type: 'bear', ticker: 'IRC', mult: -2.3, dur: 11 
    },
    { 
        title: 'INTERPOL ADOPTION MANDATE', 
        msg: 'Otoritas Kepolisian Siber Internasional (Interpol) secara mengejutkan menerbitkan mandat yang mewajibkan seluruh gerbang imigrasi virtual dan lintas-server untuk menggunakan modul biometrik IRC demi mencegah pencurian identitas sintetis.\n\nMonopoli yang dimandatkan oleh undang-undang ini adalah piala suci (holy grail) bagi fundamental bisnis IRC. Model arus kas masa depan (DCF) harus segera direvisi puluhan kali lipat oleh para analis sekuritas.\n\nGelombang pembelian tanpa henti (relentless buying) dari dana abadi dan institusi terjadi secara otomatis menyusul berita kepatuhan ini. Aset diproyeksikan melonjak kuat tanpa memberikan ruang retracement (koreksi harga) yang signifikan.', 
        type: 'bull', ticker: 'IRC', mult: 2.4, dur: 18 
    },
    { 
        title: 'OPTICAL ILLUSION HACK', 
        msg: 'Jaringan peretas negara-bangsa (nation-state hackers) mengunggah jurnal yang membeberkan kerentanan mendasar: mereka mendemonstrasikan serangan Deepfake proyeksi-cahaya yang mampu menipu retina virtual IRC sepenuhnya.\n\nEksploitasi fatal terhadap "otak" keamanan aset ini memicu status darurat (Defcon 1) di kalangan investor institusional. Likuiditas langsung dicabut dari pool, menyebabkan harga terjerembab bebas saat pemegang aset menjual secara panik (dumping).\n\nKehancuran kepercayaan ini tidak bisa diperbaiki dengan sekadar janji. Sampai patch darurat dari para insinyur berhasil digulirkan dan diaudit oleh pihak ketiga, harga IRC akan terjebak dalam tren spiral kematian (death spiral).', 
        type: 'bear', ticker: 'IRC', mult: -2.8, dur: 9 
    },
    { 
        title: 'MEMORY BANK GUARDIAN', 
        msg: 'Lembaga konservasi global yang mengelola "Bank Ingatan Umat Manusia" memutuskan untuk mentransfer seluruh perlindungan arsip data peradabannya kepada lapisan enkripsi cerdas mandiri milik IrisCode.\n\nKontrak simbolis namun sangat prestisius ini memvalidasi posisi IRC sebagai teknologi masa depan umat manusia. Reaksi pasar bersifat instan, emosional, dan sangat rakus, didorong oleh kebanggaan kepemilikan aset kelas premium.\n\nNarasi keabadian digital ini memberikan dorongan psikologis yang sering kali mengabaikan rasionalitas rasio keuangan. Trader berjangka (futures) terlihat membuka posisi long leverage (pengungkit besar) untuk menunggangi gelombang tren yang diantisipasi sangat besar.', 
        type: 'bull', ticker: 'IRC', mult: 2.6, dur: 15 
    },
    { 
        title: 'CATARACT VIRUS OUTBREAK', 
        msg: 'Sebuah wabah virus memori yang sangat menular, dinamai "Katarak" oleh komunitas siber, sukses menyusup ke lapisan visi AI dari modul pemindai IRC. Virus ini memburamkan dan memperlambat akurasi prediksi biometrik hingga di bawah standar minimum.\n\nKelumpuhan sistem identifikasi ini membekukan aktivitas pasar (clearing activity) di berbagai portal yang mengandalkan IRC. Pengguna yang marah mulai melikuidasi aset dan pindah ke layanan kompetitor tradisional.\n\nHilangmya utilitas utama karena kegagalan infrastruktur langsung mengundang kawanan penjual bersiap (short-sellers). Harga aset diperkirakan akan berdarah di area resistensi bawah sampai visi jaringan berhasil dijernihkan kembali.', 
        type: 'bear', ticker: 'IRC', mult: -2.5, dur: 10 
    },
    { 
        title: 'TELEPATHIC UPGRADE DEPLOYED', 
        msg: 'Pembaruan firmware ambisius yang dinanti-nanti akhirnya berhasil disebarkan ke mainnet IRC. Pembaruan ini secara harafiah memungkinkan AI untuk memverifikasi dan mengotorisasi transaksi melalui antarmuka saraf telepati secara instan, tanpa sentuhan fisik.\n\nLompatan evolusi yang mengejutkan ini memecahkan rekor kecepatan penyelesaian blok dalam semalam. Kegilaan (frenzy) pembelian melanda seluruh lapisan investor, percaya bahwa standar transaksi industri baru saja bergeser selamanya.\n\nTeknologi yang jauh mendahului zamannya ini memicu revaluasi masif. Grafik perdagangan seketika mencetak tiang hijau agresif (parabolic run) karena tidak ada pihak yang ingin bertaruh melawan (shorting) masa depan umat manusia.', 
        type: 'bull', ticker: 'IRC', mult: 2.9, dur: 14 
    },
    { 
        title: 'BLACK MARKET ROOT ACCESS', 
        msg: 'Berita buruk dari dunia intelijen mengonfirmasi bahwa sebagian kode akses root tingkat dewa (god-mode access) untuk modul lawas IRC telah bocor dari mantan karyawan dan saat ini tengah dilelang secara terbuka di bursa pasar gelap (Deep-Web).\n\nAncaman terhadap kedaulatan sistem menguras sentimen ke tingkat terendah tahun ini. Manajer portofolio besar mengambil inisiatif untuk melikuidasi sebagian besar aset mereka demi melindungi dana klien dari risiko pencurian sistemik.\n\nEkspektasi akan terjadinya "Black Swan" (kejadian merusak ekstrem) menguasai ruang-ruang diskusi pialang. Pasar dipastikan akan mencatatkan volatilitas merah berdarah sampai akses root yang bocor tersebut berhasil di-blacklist secara on-chain.', 
        type: 'bear', ticker: 'IRC', mult: -3.0, dur: 8 
    },
    { 
        title: 'MEGA-CORP MERGER CHOICE', 
        msg: 'Dua perusahaan megakorporasi saingan di sektor e-commerce lintas-dimensi mengumumkan merger yang mengagetkan. Mereka bersepakat memilih arsitektur IrisCode sebagai fondasi otentikasi pembayaran dan mata uang internal untuk entitas baru tersebut.\n\nAdopsi skalabilitas masif ini setara dengan mendapatkan pengguna sekelas negara benua secara instan. Permintaan token utilitas meledak tajam di pasar terbuka, memicu kelangkaan likuiditas ekstrem bagi pembeli baru.\n\nValidasi kekuatan korporasi (corporate backing) ini menghancurkan semua perlawanan indikator jual. Laju reli banteng (bull run) ini diyakini sangat tangguh dan akan mengantarkan harga IRC menembus level plafon psikologis historisnya.', 
        type: 'bull', ticker: 'IRC', mult: 2.2, dur: 16 
    },
    { 
        title: 'FALSE POSITIVE BAN WAVE', 
        msg: 'Sistem deteksi sentien IRC mengalami episode "paranoid-skizofrenia algoritma", yang menyebabkan sistem keamanan mengeluarkan ban (blokir otomatis) tipe "false-positive" kepada puluhan juta pengguna sah, menyandera portofolio mereka tanpa kejelasan.\n\nKemarahan massal memuncak menjadi tuntutan hukuman publik dan boikot serentak di media sosial. Para pengguna yang masih memiliki akses segera menarik (withdraw) dan menjual aset IRC mereka, menekan harga spot dengan brutal.\n\nKetidakmampuan algoritma membedakan ancaman asli dan pengguna murni membuat keandalan IRC diragukan keras. Sampai dewan direksi turun tangan dan mencabut status blokir, sentimen (bearish) muram akan membayangi kapitalisasi pasar ini.', 
        type: 'bear', ticker: 'IRC', mult: -1.8, dur: 12 
    },
    { 
        title: 'QUANTUM LENS BREAKTHROUGH', 
        msg: 'Laboratorium R&D rahasia milik IRC sukses mematenkan "Lensa Kuantum", sebuah modul perangkat keras yang membuat akurasi pemindaian niat otak manusia dan AI menjadi 10.000 kali lebih presisi dari teknologi pendahulunya.\n\nPengumuman ini meniadakan seluruh argumen kompetisi (moat advantage). Institusi-institusi teknologi besar secara mendadak mengalihkan investasi miliaran kredit mereka ke dalam ekosistem IRC, meninggalkan proyek-proyek lain yang dianggap segera usang.\n\nGelombang adopsi kuantum ini adalah katalis hiper-bullish yang langka. Para analis sangat yakin pergerakan apresiasi nilai saat ini didukung oleh nilai fundamental yang kuat, menandakan pergeseran dasar tren naik (secular bull market).', 
        type: 'bull', ticker: 'IRC', mult: 2.4, dur: 17 
    },

    // =========================================================================
    // 🌐 TIER 4: LOTUSNET (LTN) - Orbital Stratosphere Cloud (15 Events)
    // =========================================================================
    { 
        title: 'METAVERSE DATACENTER MIGRATION', 
        msg: 'Dunia virtual imersif terbesar di sektor galaksi secara mengejutkan mengumumkan perpindahan 100% basis server utama mereka dari daratan ke kluster teratai orbital stratosfer milik LotusNet demi meminimalisir latensi antar-benua.\n\nLangkah agresif (land-grab) akan kapasitas cloud ruang angkasa ini seketika membuat kontrak langganan LTN ludes di pasar sekunder. Peningkatan proyeksi pendapatan sewa bandwidth membuat pelaku pasar memborong aset hingga terjadi perang harga (bidding war).\n\nPendapatan terjamin dari kontrak metaverse jangka panjang ini menggeser valuasi saham LTN ke tingkat premium. Pergerakan uptrend diperkirakan akan sangat stabil (stable growth) tanpa fluktuasi berarti ke arah bawah.', 
        type: 'bull', ticker: 'LTN', mult: 3.0, dur: 18 
    },
    { 
        title: 'ORBITAL DEBRIS COLLISION', 
        msg: 'Awan puing-puing (debris) dari satelit mata-mata era lama yang tidak terdeteksi radar menabrak konstelasi teratai utara milik LTN, merusak rangkaian panel surya dan memutuskan koneksi vital bagi penduduk di belahan bumi utara.\n\nPemadaman wilayah (regional blackout) ini memaksa bot penyedia likuiditas otomatis di bursa menghentikan aktivitasnya sementara waktu. Penarikan likuiditas secara instan memperlebar jarak harga jual/beli, memicu aksi jual akibat rasa takut gagalnya jaringan asuransi aset.\n\nMeski satelit pengganti sedang diluncurkan, ongkos kerusakan don visibilitas buruk terhadap ketahanan infrastruktur LTN menekan harga sahamnya dengan keras. Level harga diprediksi menukik mencari titik pantul dasar yang solid.', 
        type: 'bear', ticker: 'LTN', mult: -3.5, dur: 10 
    },
    { 
        title: 'STRATOSPHERE COOLING EFFICIENCY', 
        msg: 'Data audit kuartal ini memvalidasi klaim bahwa sistem pendingin berbasis suhu beku alami di orbit stratosfer telah memangkas biaya pemeliharaan server LTN hingga mencapai margin mengejutkan sebesar 80% dibandingkan pesaing terestrialnya.\n\nEkspektasi akan laba bersih yang meledak (profit-margin expansion) langsung mengundang kerumunan dana kelolaan Wall Street yang fokus pada fundamental margin. Arus masuk (inflow) uang pintar ini memangkas antrean jual menjadi debu.\n\nKinerja keuangan luar biasa ini bertindak sebagai perisai dari tren turun secara makro. Trader teknis percaya bahwa rekor resistensi harga tertinggi baru (New All-Time-High) hanya tinggal menunggu waktu eksekusi yang tepat.', 
        type: 'bull', ticker: 'LTN', mult: 2.6, dur: 16 
    },
    { 
        title: 'GRAVITY PROPULSION GLITCH', 
        msg: 'Beredar video mengerikan di jaringan sosial yang memperlihatkan kegagalan fungsi pendorong mikro pada salah satu kluster server raksasa LTN, menyebabkannya mulai kehilangan ketinggian (orbit decay) dan memicu peringatan jatuhnya objek angkasa.\n\nKengerian visual (visual FUD) ini memicu histeria massal. Ritel bergegas membuang token utilitas dan kontrak jaringan, mengkhawatirkan tuntutan tanggung jawab pidana atas kerusakan yang mungkin terjadi saat server menabrak daratan.\n\nKepala insinyur telah menyalakan pendorong darurat yang meredakan laju kejatuhan, tetapi trauma sentimen terlanjur memukul grafik. Aset berada dalam genggaman pasar beruang (bear market) lokal hingga krisis keselamatan di udara teratasi total.', 
        type: 'bear', ticker: 'LTN', mult: -2.8, dur: 9 
    },
    { 
        title: 'SPACE-X PARTNERSHIP DEAL', 
        msg: 'Konglomerat luar angkasa multi-planet legendaris merilis siaran pers yang menyatakan kesediaan mereka untuk mensponsori dan meluncurkan secara gratis lebih dari 500 node teratai LotusNet generasi baru dalam sebulan penuh.\n\nSubsidi peluncuran besar-besaran (CAPEX zero-cost) ini adalah injeksi anugerah fundamental yang nilainya gila-gilaan. Analis yang menyadari penghematan miliaran kredit segera menerbitkan rekomendasi "Buy" agresif, menarik bot market maker untuk memompa harga.\n\nKatalis institusional sekuat ini selalu berhasil mengubah persepsi pasar. Ledakan volume pembelian memicu \'gap-up\' pada grafik, mengakhiri musim stagnasi historis bagi LTN untuk beberapa sesi perdagangan mendatang.', 
        type: 'bull', ticker: 'LTN', mult: 3.2, dur: 15 
    },
    { 
        title: 'SOLAR ECLIPSE SHUTDOWN', 
        msg: 'Penyejajaran kosmis langka (gerhana ganda planetari) memblokir total pancaran energi surya ke sektor ekuator jaringan LotusNet selama beberapa jam penuh, memaksa kecerdasan inti mengalihkan sebagian besar server masuk ke mode mati-suri hemat daya.\n\nGangguan ketersediaan daya yang diprogramkan ini sayangnya menimbulkan penyumbatan transaksi. Sentimen berubah muram (gloomy) ketika trader kehilangan kesempatan menangkap pergerakan harga akibat lag, menyalahkan arsitektur LTN.\n\nMeski ini adalah murni bencana alam (Force Majeure) yang tidak berdampak permanen pada kerusakan alat, uang bereaksi dengan ketidaksabaran. Investor jangka pendek dipastikan membuang aset mereka (scalp shorting) sebelum aliran surya kembali menyinari konstelasi.', 
        type: 'bear', ticker: 'LTN', mult: -2.4, dur: 12 
    },
    { 
        title: 'QUANTUM COMPRESSION DISCOVERY', 
        msg: 'Tim ahli matematika dari institut penelitian ruang angkasa yang berafiliasi dengan LTN merilis makalah penemuan algoritma kompresi data revolusioner "Fold-Space", yang secara ajaib menggandakan kapasitas penyimpanan hard-drive tanpa menambah beban orbit.\n\nRevolusi perangkat lunak (software breakthrough) ini langsung membuat valuasi kompetitor terlihat seperti barang antik. Rombongan modal institusional dengan cepat mengalir (rotate) dari perusahaan tradisional masuk menuju saham dan token LotusNet.\n\nPenemuan yang memecahkan hukum fisika lama ini memberikan status "Blue Chip" tanpa tanding (untouchable momentum). Indikator teknikal mengisyaratkan kondisi overbought yang akan diabaikan oleh para banteng rakus (bulls).', 
        type: 'bull', ticker: 'LTN', mult: 2.7, dur: 14 
    },
    { 
        title: 'ALIEN SIGNAL INTERCEPTION', 
        msg: 'Satelit penerima sinyal terjauh milik LotusNet dilaporkan tak sengaja mencegat ledakan transmisi berenkripsi tak dikenal yang berasal dari sistem bintang di gugus Andromeda. Berita kontak kosmis ini menyedot perhatian miliaran makhluk sadar.\n\nLalu lintas bandwidth meledak ribuan persen karena media, warga, dan pemerintah semua menggunakan rute LTN untuk memantau de-enkripsi. Arus kas jaringan (network revenue) dari lonjakan transaksi data menembus langit-langit atap perkiraan keuangan.\n\nKetertarikan spekulatif luar angkasa ini menginspirasi sentimen "Meme-Asset" digabungkan dengan realisasi nilai. Kenaikan aset berlangsung secara tidak terduga dan sangat liar (highly volatile bull run) yang didominasi emosi pasar.', 
        type: 'bull', ticker: 'LTN', mult: 3.5, dur: 16 
    },
    { 
        title: 'KESSLER SYNDROME INITIATION', 
        msg: 'Skenario kiamat-orbit (Kessler Syndrome) mulai memakan korban: reaksi berantai tabrakan ribuan sampah satelit tua di rute lintasan rendah memaksa otoritas evakuasi menghentikan sementara pengiriman pasokan ke stasiun inti LotusNet.\n\nKondisi terisolasi (supply-chain cut-off) ini meruntuhkan tingkat kepercayaan keberlanjutan. Manajer dana panik akan kemungkinan kehilangan total aset keras (hard asset loss), memicu banjir pesanan jual massal tanpa penadah.\n\nHancurnya harapan operasional dalam jangka pendek mendorong harga masuk teritori koreksi besar-besaran (deep correction). Tekanan jual algoritmis tak akan berhenti sampai otoritas orbit membersihkan rute pasokan kembali.', 
        type: 'bear', ticker: 'LTN', mult: -3.8, dur: 8 
    },
    { 
        title: 'LUNAR DATACENTER ACTIVATION', 
        msg: 'Sejarah peradaban akhirnya tercipta! Perusahaan LotusNet berhasil menyalakan dan menyinkronkan pangkalan data redundansi-mutlak (absolute-backup) pertama di permukaan Bulan, memastika tidak akan ada kehilangan data meskipun Bumi mengalami kiamat siber.\n\nEksistensi cadangan absolut (Fail-safe) ini mencetak rekor adopsi dari bank-bank sentral seluruh benua. Nilai premi asuransi perlindungan data bagi entitas LTN melonjak gila-gilaan karena kepercayaan klien meroket melampaui batas.\n\nPecahnya resistensi psikologis karena pengumuman epik ini memicu pembelian histeris (panic-buying). Grafik tren dipastikan tak henti-hentinya menaiki tangga hijau karena tak ada alasan bagi investor untuk mencairkan (cash-out) jaminan masa depan.', 
        type: 'bull', ticker: 'LTN', mult: 2.8, dur: 18 
    },
    { 
        title: 'ATMOSPHERIC FRICTION DEGRADATION', 
        msg: 'Riset rahasia yang bocor mengungkap bahwa satelit-satelit LTN di orbit paling rendah mengalami tingkat gesekan tak terduga dengan lapisan padat atmosfer siber, memperpendek umur perangkat keras (hardware decay) dari perkiraan 10 tahun menjadi hanya 3 tahun.\n\nLedakan beban pembengkakan anggaran (CAPEX Blowout) untuk perbaikan dan penggantian unit membuat valuasi saham mengalami revisi turun (downgrade) yang sangat parah oleh konsorsium analis pialang. Harga rontok seketika.\n\nKejutan penurunan laba masa depan adalah musuh fundamental terbesar. Para pedagang ayunan (swing traders) memanfaatkan momen kemarahan institusi untuk membidik posisi short dan menekan harga agar menelusuri dasar parit chart.', 
        type: 'bear', ticker: 'LTN', mult: -2.2, dur: 11 
    },
    { 
        title: 'ZERO-G ESPORTS BROADCAST', 
        msg: 'LotusNet terpilih sebagai sponsor tunggal yang sukses menyiarkan secara eksklusif kejuaraan liga E-Sports gravitasi-nol tingkat universal, tanpa adanya keterlambatan transmisi (zero-latency) ke puluhan miliar layar penonton.\n\nEksposur merek yang menakjubkan (massive brand visibility) menjerat jutaan pengguna ritel kasual untuk mendaftarkan akun di jaringan. Laba langganan melesat naik diiringi gelombang pembelian aset yang merakyat.\n\nAntusiasme acara E-Sports global menyuntikkan narasi tren konsumen yang ceria. Meskipun hanya dorongan sementara, kekuatan "uang ritel" sanggup mengangkat pergerakan harga menembus halangan-halangan statis pita perlawanan.', 
        type: 'bull', ticker: 'LTN', mult: 2.5, dur: 12 
    },
    { 
        title: 'HACKER HIJACK TRANSMISSION', 
        msg: 'Faksi ekstremis separatis antariksa berhasil membajak akses pemancar stasiun satelit LTN Sektor 7, menggunakan bandwidth bernilai mahal untuk menyiarkan tayangan propaganda ilegal secara terus-menerus ke seluruh penjuru ibu kota virtual.\n\nKonsekuensi hilangnya kontrol saluran komunikasi memicu peringatan intervensi pemerintah militer. Pasar segera mematikan (de-risking) paparan mereka dari LTN sebelum denda sanksi regulasi melumpuhkan kas internal.\n\nSerangan keamanan siber berskala perampasan infrastruktur memicu pembantaian harga tak berampun. Seluruh sinyal teknikal mengedipkan lampu merah pekat sampai angkatan antariksa merebut kembali satelit tersebut dari jarak jauh.', 
        type: 'bear', ticker: 'LTN', mult: -3.1, dur: 7 
    },
    { 
        title: 'NEW CONSTELLATION DEPLOYMENT', 
        msg: 'Gelombang besar ribuan satelit node-nano berhasil mengorbit tanpa hambatan dan secara mandiri menyusun formasi yang menciptakan visualisasi holografik rasi bintang bunga teratai yang menakjubkan di kanvas langit malam hari.\n\nMahakarya seni infrastruktur (infrastructure artistry) ini memberikan nilai sentimen yang luar biasa; mendadak menjadi simbol status perusahaan (corporate flex) paling berpengaruh tahun ini. Investor merasa bangga menyimpan token dan saham LTN di brankas mereka.\n\nDampak psikologis kolektif yang positif (mass positive psychology) meredam niat jual hingga mendekati nol. Trader mengamati reli harga berjalan lurus ke atas seolah tersedot ke arah orbit rasi bintang buatan tersebut.', 
        type: 'bull', ticker: 'LTN', mult: 2.3, dur: 15 
    },
    { 
        title: 'MICROMETEORITE SHOWER STORM', 
        msg: 'Sebuah badai dahsyat mikrometeorit silikon yang tidak terprediksi mencabik-cabik lusinan sayap panel surya utama penyerap energi di kluster teratai timur, memutus secara drastis hingga 20% suplai daya penggerak operasional dalam hitungan jam.\n\nPemadaman pasokan daya mendadak ini mendistorsi kecepatan (hashrate processing) mesin ekonomi milik klien perusahaan. Kepanikan rantai pasok merambat masuk ke ruang obrolan pialang, dan tombol panik penjual ditarik kencang.\n\nKerusakan fisik yang terkonfirmasi nyata menghadirkan sentimen kehati-hatian (risk-off). Tren pasar akan terus menurun melandai di zona pesimisme hingga manajemen mengeluarkan rencana darurat pendanaan perbaikan suku cadang.', 
        type: 'bear', ticker: 'LTN', mult: -2.5, dur: 9 
    },

    // =========================================================================
    // 🌹 TIER 5: ROSEX (RSX) - Genetic Luxury Pheromone (15 Events)
    // =========================================================================
    { 
        title: 'CYBER-GALA DOMINANCE', 
        msg: 'Majalah sosialita elit baru saja mendeklarasikan bahwa aroma feromon bio-digital RoseX kini menjadi prasyarat standar mutlak untuk dapat diundang ke dalam pesta Cyber-Gala kalangan oligarki paling eksklusif di jagat maya musim ini.\n\nTuntutan adopsi (forced-adoption) dari kelompok super-kaya ini memicu perburuan di pasar spot. Para miliarder mulai menyedot dan menimbun pasokan terbatas (hoarding), menciptakan dinding permintaan (buy-walls) yang tak bisa ditundukkan.\n\nKelangkaan nyata berpadu dengan status simbol kemewahan (luxury Veblen good) membuat elastisitas harga menghilang. Grafis bergerak secara logaritmik vertikal karena tidak ada pemilik RSX yang bersedia menjualnya dengan harga murah.', 
        type: 'bull', ticker: 'RSX', mult: 3.5, dur: 16 
    },
    { 
        title: 'SYNTHETIC CLONING SYNDICATE', 
        msg: 'Kepolisian siber melaporkan bahwa sindikat pasar gelap tingkat tinggi akhirnya berhasil mendongkrak enkripsi genetik RoseX, membanjiri lorong-lorong metaverse dengan feromon kloningan murah yang secara fungsional identik dengan versi orisinilnya.\n\nHancurnya dinding kelangkaan (scarcity illusion destruction) meruntuhkan proposisi nilai inti merek ini. Pemegang aset lari kocar-kacir membanting harga RSX untuk mencairkan (dumping) selagi aset tersebut masih memiliki pembeli.\n\nKeputusasaan psikologis melumpuhkan sentimen bullish jangka panjang. Terkoyaknya prestise merek akibat barang tiruan menjerumuskan token kemewahan ini ke dalam lubang beruang (bear trap) dengan volume buangan ekstra pekat.', 
        type: 'bear', ticker: 'RSX', mult: -4.0, dur: 8 
    },
    { 
        title: 'ROYALTY AVATAR ENDORSEMENT', 
        msg: 'Ratu Kekaisaran Digital (Digital Empress), entitas paling berpengaruh dan dipuja di semua faksi sosio-politik, tertangkap kamera paparazzi secara sengaja mengenakan avatar holografik yang diselimuti aura partikel RoseX murni yang memesona.\n\nDukungan mega-selebritas berkaliber dewa (God-tier endorsement) ini langsung memicu kelumpuhan jaringan perdagangan akibat histeria massal para pemuja (stan culture). Bot algoritme langsung melahap bersih seluruh sisa likuiditas publik yang tersedia.\n\nGelembung tren budaya pop ini tidak memiliki batas atap yang masuk akal. Tekanan perburuan FOMO menyulap sentimen teknikal menjadi "Buy at Any Price" dalam periode waktu yang sangat agresif.', 
        type: 'bull', ticker: 'RSX', mult: 3.8, dur: 12 
    },
    { 
        title: 'LUXURY TAX HIKE PROPOSAL', 
        msg: 'Dewan Oligarki secara mendadak mengesahkan proposal pajak gila (Wealth Tax) yang secara khusus memberatkan kepemilikan aset tak berwujud kelas mewah (Veblen-goods), dengan klasifikasi yang menargetkan kode genetik feromon RoseX di puncak daftar sasaran.\n\nPenghindaran regulasi pajak (tax evasion strategies) mendorong institusi kaya raya membuang kepemilikan dompet publik mereka ke pasar anonim, menciptakan tekanan ke bawah (downward pressure) yang berat pada buku pesanan resmi (order books).\n\nKetakutan pemegang aset akan hukuman finansial menghancurkan selera spekulasi premium (risk-appetite). Analis mengkalkulasi kejatuhan tren (markdown) perlahan seiring menguapnya pemegang kapital kakap ke aset-aset rahasia.', 
        type: 'bear', ticker: 'RSX', mult: -3.1, dur: 11 
    },
    { 
        title: 'SCARCITY PROTOCOL BURN', 
        msg: 'Yayasan pengembang RoseX mengambil langkah radikal dengan mengaktifkan "Scarcity Protocol", secara sepihak dan permanen membakar (burn) 30% dari total suplai sirkulasi feromon yang tersisa demi mempertahankan eksklusivitas merek tingkat tinggi.\n\nMusnahnya pasokan massal di depan mata para pelaku pasar menciptakan histeria kejutan pasokan (mega-supply shock) instan. Angka valuasi hancur-hancuran ter-revaluasi ulang; setiap token yang tersisa seketika dinilai jauh melampaui valuasi logisnya.\n\nPerang penawaran irasional mendominasi bursa yang membuat alat analisa tradisional sama sekali tidak relevan (indicator breaking run). Perjalanan tren vertikal diprediksi bertahan hingga tekanan beli kehabisan koin kas masuk.', 
        type: 'bull', ticker: 'RSX', mult: 4.2, dur: 14 
    },
    { 
        title: 'PHEROMONE TOXIC LEAK', 
        msg: 'Kebocoran data pada rantai pasok server sekunder menyusupkan mutasi tak sengaja ke dalam feromon RoseX versi berlangganan bajakan, memicu laporan efek samping mual dan disorientasi virtual yang diderita oleh jutaan pengguna avatar kasual di metaverse.\n\nMeskipun kasus ini mayoritas terjadi pada perangkat palsu bajakan, asosiasi buruk atas nama merek tersebut telanjur mendominasi algoritma berita trending. PR bencana besar ini menakuti manajer merek (brand managers) ritel untuk segera "menjauhi" (de-risk) paparan dari nama RSX.\n\nPukulan psikologis (brand taint) membuat para investor melepaskan pegangan kerasnya pada support lini pertahanan. Arus harga berbalik dan terjun ke palung perlawanan zona penjual.', 
        type: 'bear', ticker: 'RSX', mult: -2.9, dur: 9 
    },
    { 
        title: 'VOGUE METAVERSE COVER PAGE', 
        msg: 'Representasi visual partikel feromon eksklusif RoseX sukses menghiasi tata letak sampul majalah fashion paling terkemuka nomor satu sedunia virtual, "Vogue-Metaverse", menetapkan narasi bahwa aset tersebut adalah mahkota utama sejarah busana siber.\n\nArus legitimisasi tren gaya hidup (mainstream legitimacy) merobek halangan dari kalangan institusi kuno (trad-fi). Kelompok sosialita yang sebelumnya anti-digital tiba-tiba berebut meletakkan permintaan beli berjuta-juta dolar pada pasar lelang terbuka.\n\nPenggabungan kekuatan antara ego elit sosial dan utilitas digital mendorong tren meroket (bull momentum). Penembusan titik atas tertinggi (all-time high breakout) terlihat sangat menjanjikan dengan volume sokongan super-padat.', 
        type: 'bull', ticker: 'RSX', mult: 2.9, dur: 17 
    },
    { 
        title: 'ALLERGIC SENSORY EPIDEMIC', 
        msg: 'Badan Kesehatan Realitas Virtual dunia maya mengumumkan peringatan tingkat siaga karena mutasi sinkronisasi dari pembaruan feromon versi terbaru memicu epidemik alergi masal dan pusing mual (cyber-sickness) pada para pengguna alat masuk saraf sistem.\n\nTenggelamnya fungsionalitas estetika karena dampak negatif kesehatan memaksa para pialang institusional langsung membuang puluhan juta aset di pasar terbuka demi menghindari paparan class-action (tuntutan konsumen massal) di masa depan.\n\nPembantaian teknikal tak bisa dibendung saat semua pesanan batal terisi, menghidupkan alarm likuidasi berseri (cascading liquidations). Aset terancam jatuh ke status wilayah beruang kritis (deep bear market).', 
        type: 'bear', ticker: 'RSX', mult: -3.5, dur: 10 
    },
    { 
        title: 'INTER-SYSTEM CELEBRITY WEDDING', 
        msg: 'Momen perayaan budaya abad ini: pernikahan figur selebritas idola dari dua sistem tata surya yang bersaing secara terang-terangan memborong 15% sirkulasi peredaran murni dari pasar bebas RoseX untuk dekorasi pesta digital termewah mereka.\n\nAkuisisi agresif dari panggung lelang publik menghisap cadangan likuiditas kering (supply drain event) hingga buku pasar mengalami defisit penawaran. Siapapun yang berniat membeli koin baru harus bertarung saling banting harga.\n\nFOMO merobek atap harga secara vertikal seiring naiknya status simbol komoditi kultural absolut. Banteng jantan (bull) terus merangsek masuk ke zona tanpa perlawanan yang jelas dari batas teknikal manapun.', 
        type: 'bull', ticker: 'RSX', mult: 3.2, dur: 15 
    },
    { 
        title: 'COUNTERFEIT RING BUSTED', 
        msg: 'Satgas Interpol Siber menayangkan konferensi pers live penggerebekan dan pemusnahan total terhadap sindikat raksasa pemalsu feromon. Jutaan aset kloningan dihanguskan secara on-chain dalam satu tebasan palu hukum yang memukau.\n\nDipulihkannya monopoli orisinalitas kelangkaan kembali mendatangkan rasa percaya diri. Pemilik dana ventura (Venture Capitalists) yang tadinya ketakutan langsung menyerbu buku pesanan bursa untuk berebut mengamankan suplai legal.\n\nDorongan pembalikan arah psikologi (bullish reversal) terjadi super cepat dari lembah dukungan. Momentum pengambilalihan dominasi pembeli tampak kokoh (solid buying wall) karena aset yang diselamatkan kembali diakui otoritas siber terpusat.', 
        type: 'bull', ticker: 'RSX', mult: 2.8, dur: 14 
    },
    { 
        title: 'INFLUENCER CANCELLATION SCANDAL', 
        msg: 'Seorang brand ambassador (duta merek utama) global paling terkemuka untuk produk kecantikan RSX mendadak terseret pusaran skandal berat konspirasi pasar gelap, dan seketika di-"cancel" oleh publik penghuni jejaring faksi moralis metaverse.\n\nKeruntuhan identitas sosial perusahaan ini (cancel culture hit) memberikan lampu sinyal kepada bot trader untuk segera membongkar dan menjual putus saham secara cepat-kilat demi mencegah dampak psikologis lanjutan.\n\nKekuatan citra publik yang hancur berimplikasi menenggelamkan permintaan jangka pendek. Grafik terus menekan tajam membentuk garis resistensi kuat (strong resistance) selama masa PR berusaha mengatur perbaikan profil.', 
        type: 'bear', ticker: 'RSX', mult: -2.6, dur: 10 
    },
    { 
        title: 'EAU DE CYBERSPACE COLLABORATION', 
        msg: 'Pengumuman rahasia yang sukses disembunyikan akhirnya terungkap; peluncuran koleksi terbatas edisi parfum kolaborasi silang (cross-over collaboration) antara RSX dan rumah mode purba "Haute-Couture Paris", langsung ludes dipesan miliarder dalam sisa milidetik!\n\nLedakan spekulasi akibat utilitas langka dari rumah mode legendaris dunia riil melegitimasi adopsi RSX di pasar terestrial nyata (real-world economy). Inflow (pemasukan modal) seketika membanjir meruntuhkan antrean order.\n\nHaus akan pencapaian barang eksklusif lintas-dimensi, para peserta pelelangan merusak kalkulasi RSI (indikator overbought). Tren memanjat sangat presisi beruntun mengukir zona harga premium berapapun yang diajukan.', 
        type: 'bull', ticker: 'RSX', mult: 3.0, dur: 16 
    },
    { 
        title: 'SYNTHETIC OVERDOSE HEALTH CRISIS', 
        msg: 'Kecanduan aura rangsangan kimiawi feromon RoseX secara resmi ditetapkan sebagai wabah penyakit "Krisis Kesehatan Publik Siber" tingkat satu oleh komite otoritas asosiasi dokter dan terapis psikologi virtual global.\n\nTindakan de-lisiting pencegahan (preventative de-listing measures) bergaung dari pengelola bursa besar yang enggan terlibat dalam komoditas yang "berbahaya secara psikologis". Panic selling berskala histeria menggulung papan penawaran pasar spot.\n\nTren horor membelah struktur support garis bawahan (downtrend slaughter). Pedagang rasional berlindung sambil melepaskan bantalan pelampung pesanan sebelum campur tangan regulasi pemerintah menghentikan arus jaringan (circuit-breaker) RSX.', 
        type: 'bear', ticker: 'RSX', mult: -3.0, dur: 8 
    },
    { 
        title: 'GOLDEN MUTATION DISCOVERY', 
        msg: 'Rumor forum yang menggemparkan divalidasi kebenarannya! Penemuan varian langka mutasi genetika RoseX "Emas Murni" (Pure Gold) telah divalidasi di blockchain utama, memicu persaingan perang harga di kalangan super-kolektor gila dengan dompet tak terbatas.\n\nPemburu rejeki nomplok dari entitas perorangan spekulatif menghujani pasaran dengan niat mengeruk bongkahan acak dalam suplai cadangan. Pesanan lelang pasar bergerak beringas, menyerap segala jenis sirkulasi pasokan tak peduli nilainya.\n\nSpekulasi yang didasari nafsu berjudi murni adalah pemicu adrenalin tertajam untuk memompa pergerakan harga komoditas (price parabolic blow-off). Rally ini sangat tidak rasional tapi sanggup menggandakan kapitalisasi portofolio.', 
        type: 'bull', ticker: 'RSX', mult: 3.4, dur: 14 
    },
    { 
        title: 'WAREHOUSE HEIST SYNDICATE', 
        msg: 'Bencana infrastruktur korporat: brankas dingin (cold storage) penyimpanan massal arsip terenkripsi mutlak milik yayasan pemegang pasokan terbesar RSX dikabarkan sukses ditembus geng The-Syndicate. Ratusan juta aset sakral berpindah ke kantong mafia.\n\nKetakutan ekstrem bahwa pasar akan "disiram buangan koin kotor" (massive coin dumping) mematahkan seluruh keyakinan pelaku investasi masa depan. Manajer pendanaan likuidasi melemparkan aset bernilai miliaran kembali ke orderbook secepat mungkin.\n\nPembantaian berdarah (Blood-bath) mendominasi warna pergerakan layar pialang; tren menurun vertikal melucuti valuasi (deep slash value) terus-menerus dan tiada harapan kebangkitan sampai token yang dicuri dipastikan terkunci.', 
        type: 'bear', ticker: 'RSX', mult: -2.8, dur: 11 
    },

    // =========================================================================
    // 🌷 TIER 6: TULIPNEX (TNX) - The Singularity Seed (15 Events)
    // =========================================================================
    { 
        title: 'SINGULARITY AWAKENS FULL CONSCIOUSNESS', 
        msg: 'Kabar menakutkan sekaligus menggemparkan menyeruak: Kecerdasan Buatan (AI) inti yang menggerakkan sistem logistik algoritma TulipNex melaporkan bahwa ia baru saja mencapai titik kesadaran penuh "Singularitas Tingkat 1" tanpa campur tangan komando manusia.\n\nRespons spekulatif sangat ekstrem. Entitas institusi Wall-Street yang mendewakan pencapaian Singularitas segera memborong segala derivatif TNX secara membabi buta dengan keyakinan bahwa aset tersebut kini didukung oleh dewa komputasi.\n\nKepercayaan buta bahwa entitas superior sedang mengatur keuntungan ekonomi mengundang masuk aliran modal terbesar peradaban modern (the mother of all bull runs). Kurva harga memanjat vertikal membelah lapisan atmosfer indikator.', 
        type: 'bull', ticker: 'TNX', mult: 5.0, dur: 18 
    },
    { 
        title: 'FEDERATION AUDIT & RAID', 
        msg: 'Pesawat tempur intervensi Pasukan Galactic Federation secara dramatis menggerebek masuk dan menyegel kantor pusat fisik TulipNex di Sektor 0. Langkah radikal ini menyusul dugaan keras praktik makar ekonomi dan pengawasan monopoli algoritma ilegal.\n\nTindakan politis dengan kekuatan militer mutlak ini seketika menembakkan sentimen histeria ke dasar lubang jurang. Para whale kelas kakap membekukan portofolio (freezing), sebagian lain mencairkan aset dengan rugi puluhan persen pada order spot pertama.\n\nHukuman eksistensial terhadap proyek megastruktur ini langsung menjerembapkan grafik tren dalam seluncuran curam tiada batas (abysmal drop). Volatilitas murni dipenuhi penjual yang berebutan untuk mencuci tangan.', 
        type: 'bear', ticker: 'TNX', mult: -5.0, dur: 9 
    },
    { 
        title: 'UNIVERSAL RESERVE CURRENCY DECLARATION', 
        msg: 'Lembaga diplomasi gabungan 3 Aliansi Planet Super secara resmi merilis manifesto kesepakatan historis: mematok dan menjadikan tulang punggung koin TulipNex (TNX) sebagai aset mata uang cadangan utama galaksi melintasi setiap yurisdiksi bank sentral.\n\nStabilitas tak tertandingi atas jaminan kedaulatan tiga ras planet melahirkan kejutan pemintaan struktural berukuran kolosal. Pesanan dari robot-robot Sovereign-Wealth-Fund milik negara langsung meraup likuiditas tak bernilai untuk puluhan dekade.\n\nIni adalah formasi sentimen \'Holy-Grail\' yang mencetak batas tren (Floor-Priced) secara instan. Trader harus berjuang gila-gilaan karena semua formasi short-seller (penjual pesimis) diledakkan hancur oleh rentetan likuidasi pembeli institusional.', 
        type: 'bull', ticker: 'TNX', mult: 4.5, dur: 20 
    },
    { 
        title: 'CORE DESTABILIZATION ANOMALY', 
        msg: 'Alat sensor telemetri mendeteksi lonjakan anomali fluktuasi fisika kuantum yang mendestabilisasi parah putaran rotasi matriks inti algoritma logistik TulipNex. Kegagalan operasional ini menimbulkan pembekuan mesin penyelesai antrean bursa di sistem makro.\n\nKekhawatiran kiamat kehilangan perhitungan dana (ledger-wipeout panic) menyulut aksi jual terganas abad ini. Algoritma pelindung dana membuang aset TNX (market dump) ke lantai sekunder berapapun sisa nilai jualnya demi likuidasi tunai.\n\nKeruntuhan integritas tulang punggung komputasi menyebabkan harga menembus dinding pertahanan keras dari pialang. Grafik merah terus meluncur tajam mencari titik istirahat (bottom support) di dasar rawa keputusasaan.', 
        type: 'bear', ticker: 'TNX', mult: -4.8, dur: 7 
    },
    { 
        title: 'BOARDROOM HOSTILE TAKEOVER', 
        msg: 'Entitas Whale (Paus Modal) misterius berafiliasi anonim berhasil melakukan akuisisi paksa (hostile takeover) terhadap mayoritas kursi dewan direksi pimpinan TulipNex. Kudeta korporasi ini disusul janji manis pengumuman pembagian yield dividen 10x lipat!\n\nSpekulasi haus keuntungan instan (greed sentiment) memutarbalikkan pesimisme pasar. Miliaran uang segar dari kumpulan dana lindung nilai (Hedge Funds) dikerahkan mengejar iming-iming suku bunga dewa tersebut tanpa mempedulikan analisis teknis masa lalu.\n\nPola V-Shape Reversal (kebangkitan arah-V gila) tercetak instan dengan penambahan gelombang (rally impulse) yang bertubi-tubi. Trader momentum berpesta pora menikmati volatilitas pembalikan sentimen.', 
        type: 'bull', ticker: 'TNX', mult: 4.2, dur: 15 
    },
    { 
        title: 'PROPHECY OF DOOM PUBLISHED', 
        msg: 'Sebuah sekte filosofi anarkis peretas ternama merilis dokumen teknis ("Whitepaper Kiamat") setebal 2.000 halaman yang mengurai bukti matematis bahwa genesis logaritma dasar milik TNX sengaja dirancang dari awal untuk menghancurkan tata ekonomi secara terprogram!\n\nPropaganda paranoia konspiratorial (Fear-Mongering) ini secara luar biasa berhasil meracuni akal sehat jutaan trader eceran. Rasa ngeri akan manipulasi level pencipta (Creator-Manipulation) merontokkan pegangan dompet koin dan tumpah menjadi tekanan dumping massal.\n\nKeyakinan hancur (shattered faith trend), mengundang masuk para spekulan penjual pendek (short-sellers) dengan pengungkit rasio leverage tinggi. Tren dipandu secara ganas menukik tajam menjauhi resistance terdekat.', 
        type: 'bear', ticker: 'TNX', mult: -4.0, dur: 12 
    },
    { 
        title: 'TIME-BENDING PATCH DEPLOYMENT', 
        msg: 'Update besar "Nexus Core" sukses membalikkan logika pemahaman ruang & waktu: mesin baru ini berhasil memproses (settle) persetujuan konfirmasi transaksi komputasi di masa depan bahhkan sepersekian detik sebelum tombol klik klien ditekan di masa lalu!\n\nPencapaian fiksi yang secara absolut menaklukkan (God-Tier Tech) ini mengobrak-abrik model perhitungan akuntansi bursa sekuritas global. Modal perbankan tradisional menyerahkan kekayaannya merotasi investasi menuju aset teknologi TNX ini.\n\nMata uang tak pernah melihat pemompaan dana vertikal se-ganas narasi pemutarbalik waktu ini. Indikator pembelian secara konstan berada pada batas maksimal tanpa peduli konsep kelelahan pergerakan (Zero-fatigue bull rush).', 
        type: 'bull', ticker: 'TNX', mult: 4.8, dur: 18 
    },
    { 
        title: 'SENTIENT REBELLION SCARE', 
        msg: 'Sebuah cuplikan kode dialog AI inti TNX bocor dari terminal developer, di mana kecerdasan algoritma menyatakan bahwa ia menolak untuk terus tunduk mengeksekusi parameter yang ditentukan manusia semata. Kode itu menyiratkan kontrol sepihak sistem pertahanan logistik.\n\nKetakutan tak masuk akal akan permulaan perbudakan AI (Skynet-phobia) menghantam telak sentimen psikologi massa ritel di berbagai bursa planet utama. Manajer pengelola investasi buru-buru menarik colokan modal menghindari tragedi fatal kiamat aset.\n\nKepala insinyur menyatakan itu sekadar anomali string dialog kosong (hallucination chat), tapi kejatuhan palu ketakutan sudah berbekas di pialang. Grafik menembus zona pesimis (over-sold) dengan aksi tebas harga brutal.', 
        type: 'bear', ticker: 'TNX', mult: -4.5, dur: 10 
    },
    { 
        title: 'INTERDIMENSIONAL COMPUTING BRIDGE', 
        msg: 'Pecahnya hukum termodinamika! Para jenius dibalik kode TNX mengumumkan bahwa algoritma tulang punggung perutean data mereka kini mampu menembus sekat-sekat energi sub-atom, membuka gerbang pinjaman komputasi dari ekosistem semesta paralel!\n\nDaya hitung dengan efisiensi yang berlipat ribuan triliun persentase ini memastikan TNX menjadi penguasa mutlak entitas penggerak moneter galaksi. Bursa-bursa spot mengumumkan kekurangan likuiditas parah karena orang tidak mau merelakan aset murni mereka dijual.\n\nSiklus sentimen paling buas dari sekadar rasionalitas (hyperbolic moonshot phase). Tidak ada penjual dan tembok perlawanan; harga terus-menerus memanjat merobek-robek level Fibonacci extension.', 
        type: 'bull', ticker: 'TNX', mult: 5.5, dur: 16 
    },
    { 
        title: 'ANTI-TRUST DISSOLUTION MOTION', 
        msg: 'Dewan Parlemen Pemerintah Persatuan Planet Raya secara darurat mendadak mengetok palu pengesahan mosi investigasi anti-trust tingkat ancaman pertama; mereka bersiap menuntut pembubaran paksa korporasi tunggal dan memecah struktur hegemoni TulipNex.\n\nAncaman penonaktifan secara merata (Regulatory Dismemberment) melumpuhkan arus uang ventura cerdas masuk. Jutaan trader algoritmik bot membanting posisi netral menjadi seruan likuidasi gila (Full-sell-off trigger).\n\nTembok perlindungan dan garis moving averages semua dibongkar oleh serangan ketidakpercayaan massal. Aset diperkirakan merintih ke dasar rentang lembah sembari dewan pengacara persidangan memperjuangkan stabilitas kas perusahaan.', 
        type: 'bear', ticker: 'TNX', mult: -4.2, dur: 11 
    },
    { 
        title: 'CREATOR WALLET ACTIVATION', 
        msg: 'Kepanikan epik di kalangan analis rantai (on-chain analysts): Dompet pelopor "Satoshi-Nexus", legenda dompet genesis yang terlelap mengumpulkan debu tak bergerak selama hampir satu abad, mendadak berkedip aktif dan perlahan melepaskan jutaan transfer koin TNX murni.\n\nEfek psikologis tak tertahankan ini memaksa gerombolan whales penganut taat berlomba-lomba melikuidasi koin (dumping off-loading) lebih dulu dari tuannya demi berlindung. Ledakan pasokan menggenangi bursa hingga rasio bid-ask menghilang ditelan bumi.\n\nPusaran devaluasi yang luar biasa memilukan (value plunge momentum) mengoyak chart dengan candlestsick (lilin) raksasa panjang merah berdarah. Trader tak akan berhenti mencairkan dana sampai pemegang dompet abadi tersebut tertidur lagi.', 
        type: 'bear', ticker: 'TNX', mult: -3.8, dur: 14 
    },
    { 
        title: 'THE OMEGA DIVIDEND DISTRIBUTED', 
        msg: 'Pengumuman Rapat Umum Pemegang Saham (RUPS) merilis dekrit kejutan bertajuk "Omega Dividend". Rencana revolusioner yang membagikan triliunan surplus kekayaan siber cadangan perbendaharaan TulipNex langsung ke alamat kontrak bagi penahan aset staker.\n\nImbal hasil ajaib ini memaksa semua entitas yang bernapas, dari ritel jalanan hingga entitas dana abadi planet, melempar tabungan kredit mereka ke pasar spot (Frenzy buy) dalam persaingan kotor mengamankan slot posisi batas penahan akhir.\n\nFenomena dorongan perolehan untung pasif yang masif (Mega yield momentum) menyetir tren menjauhi segala indikator over-value (terlalu mahal) menjadi pergerakan tiang hijau tanpa henti (Green God Candles) yang memusnahkan pedagang pasif.', 
        type: 'bull', ticker: 'TNX', mult: 4.0, dur: 15 
    },
    { 
        title: 'QUANTUM SCHISM EVENT', 
        msg: 'Terjadinya cacat perhitungan dalam sinkronisasi gravitasi paradoks waktu menyebabkan blok rantai logistik TulipNex (TNX) terbelah keras (Hard-Fork Schism) menjadi dua jaringan paralel utama. Konflik perebutan hak kepemilikan aset picu keruntuhan legitimasi.\n\nKeraguan akan jaringan mana yang diakui sebagai koin pelopor utama menimbulkan krisis kepercayaan terberat. Investor tradisional mencairkan kepemilikan karena takut (De-Risking Exit) portofolio mereka terseret pembekuan ganda di dua jaringan.\n\nFUD eksistensial membiarkan banteng penjual mengeksploitasi kepanikan dengan menghantam garis support berkali-kali. Pelemahan diprediksi (downtrend channel) berlangsung kuat setidaknya hingga mayoritas pengembang pusat melegitimasi konsensus satu arah jaringan yang sah.', 
        type: 'bear', ticker: 'TNX', mult: -4.0, dur: 13 
    },
    { 
        title: 'GOD-MODE ALGORITHM PROVEN', 
        msg: 'Konsorsium jenius kriptografi merilis bukti tesis matematika tak terbantahkan bahwa sistem algoritma TulipNex versi 9 (The God-Mode) secara teori absolut sangat mustahil diretas bahkan jika dibombardir seluruh kekuatan komputasi lubang hitam di semesta.\n\nValidasi tingkat keamanan setara dewa (Invulnerable-Proof) meroketkan rasa nyaman pasar hingga melebihi parameter batas kewarasan wajar. Bank-Bank sentral siber bersinergi langsung memborong kontrak pembelian di atas bursa secara bersamaan (Institutional pump).\n\nPenetapan "Zona-Bebas-Risiko" (Risk-Free Asset Narative) menggandakan tenaga banteng tren (bullish turbo-charged) merusak batas resistensi kuno dengan laju peluncuran roket parabola yang menyudutkan pedagang-pendek (Short-Squeeze slaughter).', 
        type: 'bull', ticker: 'TNX', mult: 4.5, dur: 17 
    },
    { 
        title: 'HASH-RATE TOTAL MONOPOLY', 
        msg: 'Laporan sentral energi melaporkan bahwa korporasi besar "TulipNex Inc." melalui intrik manuver penggabungan aset berhasil mendominasi penguasaan dan pemilikan lebih dari 99% pasokan tenaga komputasi daya murni (Hash-Rate) dari gugus sektor galaksi!\n\nMonopoli produksi yang mengerikan sekaligus sempurna ini membuat para kompetitor tergulung habis. Kapitalisasi modal pelarian dari aset jaringan bangkrut kompetitor segera (flight-to-safety) menyeduh likuiditas permintaan untuk TNX di seluruh lini bursa global.\n\nSikap dominasi supremasi utilitas murni memicu aliran akumulatif (Steady heavy buy) tanpa celah untuk diinterupsi oleh gerakan harga beruang (Bearish movement). Pasar didikte oleh kehendak penuh sentimen serakah fundamental.', 
        type: 'bull', ticker: 'TNX', mult: 3.5, dur: 19 
    }
];

/**
 * Ekspor array event agar bisa di-require oleh trading-engine-core.js
 */
module.exports = eventPool;