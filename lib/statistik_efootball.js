/**
 * Database Statistik Pemain eFootball
 * Lokasi: lib/statistik_efootball.js
 * Deskripsi: Kumpulan data atribut/statistik pemain eFootball
 */

const dbStatistik = [
    // --- SERANGAN ---
    { id: "Kesadaran Menyerang", en: "Offensive Awareness", cat: "Serangan", desc: "Menunjukkan kecepatan reaksi saat menyerang, seperti saat berlari melewati pertahanan." },
    { id: "Kontrol Bola", en: "Ball Control", cat: "Serangan", desc: "Menunjukkan akurasi saat menyetop bola atau menggunakan tipuan untuk membangun serangan." },
    { id: "Dribel", en: "Dribbling", cat: "Serangan", desc: "Menunjukkan akurasi, kegesitan, serta kecepatan maksimal dan akselerasi saat mendribel." },
    { id: "Dribel Akurat", en: "Tight Possession", cat: "Serangan", desc: "Menunjukkan seberapa baik pemain dalam berubah arah sambil mendribel dengan kecepatan rendah." },
    { id: "Umpan Rendah", en: "Low Pass", cat: "Serangan", desc: "Menunjukkan akurasi dan kecepatan Umpan Rendah (umpan terobosan, umpan silang, dll.)." },
    { id: "Umpan Lambung", en: "Lofted Pass", cat: "Serangan", desc: "Menunjukkan akurasi dan kecepatan Umpan Lambung (umpan terobosan cip, dll.)." },
    { id: "Penyelesaian", en: "Finishing", cat: "Serangan", desc: "Menunjukkan akurasi tembakan, termasuk tembakan first time atau saat hilang keseimbangan." },
    { id: "Sundulan", en: "Heading", cat: "Serangan", desc: "Menunjukkan akurasi sundulan dan kecepatan saat menembak, mengumpan, atau menyapu bola." },
    { id: "Eksekusi Bola Mati", en: "Place Kicking", cat: "Serangan", desc: "Menunjukkan akurasi pemain saat bola mati termasuk tendangan bebas dan penalti." },
    { id: "Lengkung", en: "Curl", cat: "Serangan", desc: "Menunjukkan tingkat lengkung yang dapat dilakukan pada tembakan, umpan, dan bola mati." },
    
    // --- PERTAHANAN ---
    { id: "Kesadaran Bertahan", en: "Defensive Awareness", cat: "Pertahanan", desc: "Menunjukkan kecepatan reaksi saat bertahan, seperti saat menekan pemain yang menguasai bola." },
    { id: "Menekel", en: "Tackling", cat: "Pertahanan", desc: "Menunjukkan jarak tekel (sleding, berdiri, dll.) yang digunakan untuk merebut bola." },
    { id: "Agresi", en: "Aggression", cat: "Pertahanan", desc: "Menunjukkan seberapa agresif pemain saat menekan atau menekel untuk merebut bola." },
    { id: "Keterlibatan Bertahan", en: "Defensive Engagement", cat: "Pertahanan", desc: "Menunjukkan kemauan untuk bertahan, seperti kembali ke posisi dengan cepat." },
    { id: "Kesadaran Kiper", en: "GK Awareness", cat: "Pertahanan", desc: "Menunjukkan kecepatan reaksi kiper dan memengaruhi pemosisian dan kecepatan bangkit berdiri." },
    { id: "Tangkapan Kiper", en: "GK Catching", cat: "Pertahanan", desc: "Menunjukkan kemampuan pemain untuk menangkap bola saat berada di depan gawang. Nilai yang lebih tinggi berarti pemain dapat menangkap tembakan yang lebih kuat." },
    { id: "Tepisan Kiper", en: "GK Parrying", cat: "Pertahanan", desc: "Menunjukkan kemampuan kiper menghalau bola dengan aman untuk mencegah kesempatan menembak kedua." },
    { id: "Refleks Kiper", en: "GK Reflexes", cat: "Pertahanan", desc: "Menunjukkan kemampuan kiper untuk merespons tembakan jarak dekat, seperti saat satu lawan satu." },
    { id: "Jangkauan Kiper", en: "GK Reach", cat: "Pertahanan", desc: "Menunjukkan jangkauan menghalau bola kiper terhadap tembakan berkecepatan tinggi atau akurat." },
    
    // --- KEKUATAN ---
    { id: "Kecepatan", en: "Speed", cat: "Kekuatan", desc: "Menunjukkan seberapa cepat pemain dapat berlari dan memengaruhi gerakan dan dribel." },
    { id: "Akselerasi", en: "Acceleration", cat: "Kekuatan", desc: "Menunjukkan kecepatan akselerasi dan memengaruhi gerakan dan dribel." },
    { id: "Kekuatan Tendangan", en: "Kicking Power", cat: "Kekuatan", desc: "Menunjukkan tingkat kekuatan yang dapat diberikan saat menembak, mengumpan, dan pada bola mati." },
    { id: "Melompat", en: "Jumping", cat: "Kekuatan", desc: "Menunjukkan kemampuan melompat dan memengaruhi sundulan tinggi dan keberhasilan duel di udara." },
    { id: "Kontak Fisik", en: "Physical Contact", cat: "Kekuatan", desc: "Menunjukkan seberapa baik pemain dapat menjauhkan lawan dan menjaga keseimbangannya ketika didesak." },
    { id: "Keseimbangan", en: "Balance", cat: "Kekuatan", desc: "Menunjukkan seberapa baik pemain dapat menahan tekel dan tetap berdiri saat kehilangan keseimbangan karena kontak fisik." },
    { id: "Stamina", en: "Stamina", cat: "Kekuatan", desc: "Menunjukkan level kebugaran dan daya tahan pemain." }
];

module.exports = dbStatistik;