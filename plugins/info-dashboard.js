const { createCanvas, loadImage, registerFont } = require('canvas');
const levelling = require('../lib/levelling');
const { createHash } = require('crypto');
const path = require('path');
const fs = require('fs');

try {
    // Memuat font dari folder src/font (berdasarkan root direktori bot)
    registerFont(path.join(process.cwd(), 'src/font/Montserrat-Black.ttf'), { family: 'Montserrat-Black' });
} catch (e) {
    console.error('⚠️ Font Montserrat tidak ditemukan di src/font/Montserrat-Black.ttf. Menggunakan font default.');
}

try {
    // Menggunakan process.cwd() untuk menunjuk langsung ke direktori root bot Anda
    const fontPath = path.join(process.cwd(), 'src', 'font', 'Montserrat-Bold.ttf');
    if (fs.existsSync(fontPath)) {
        // Daftarkan font (gunakan nama keluarga 'Montserrat')
        registerFont(fontPath, { family: 'Montserrat', weight: 'normal' });
        registerFont(fontPath, { family: 'Montserrat', weight: 'bold' });
        
        console.log('✅ [Papan Pemuka] Font Montserrat berhasil dimuat!');
    } else {
        console.log(`⚠️ [Papan Pemuka] File font tidak ditemukan di: ${fontPath}`);
    }
} catch (e) {
    console.log(`⚠️ [Papan Pemuka] Gagal memuat font: ${e.message}`);
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.sender));
    if (!who.includes('@')) who += '@s.whatsapp.net';

    let users = global.db.data.users;
    let user = users[who];
    if (!user) return m.reply(`⚠️ Pengguna tidak ditemukan dalam database.`);

    await m.reply(global.wait || '⌛ _Sedang merancang antarmuka premium dengan font Montserrat..._');

    // 1. PENYIAPAN DATA
    let { name, exp, level, money, registered, activeTitle, tulipnex, ivylink, lilybit, iriscode, lotusnet, rosex } = user;
    let { min, xp, max } = levelling.xpRange(level, global.multiplier);
    
    let p = global.db.data?.settings?.trading?.prices || { IVL: 3000, LBT: 100000, IRC: 1000000, LTN: 10000000, RSX: 100000000, TNX: 1000000000 };
    let assetValue = (ivylink || 0) * p.IVL + (lilybit || 0) * p.LBT + (iriscode || 0) * p.IRC + (lotusnet || 0) * p.LTN + (rosex || 0) * p.RSX + (tulipnex || 0) * p.TNX;
    
    let networth = (money || 0) + assetValue;
    let totalItems = (ivylink || 0) + (lilybit || 0) + (iriscode || 0) + (lotusnet || 0) + (rosex || 0) + (tulipnex || 0);

    const itemInventory = [
        { label: 'TulipNex', qty: tulipnex || 0 }, { label: 'RoseX', qty: rosex || 0 }, { label: 'LotusNet', qty: lotusnet || 0 },
        { label: 'IrisCode', qty: iriscode || 0 }, { label: 'LilyBit', qty: lilybit || 0 }, { label: 'IvyLink', qty: ivylink || 0 }
    ];

    let role = (level <= 2) ? 'Trader' : (level <= 50) ? 'Trader' : (level <= 100) ? 'Trader' : (level <= 500) ? 'Trader' : 'Trader';
    let tnxHolders = Object.entries(users).filter(u => (u[1].tulipnex || 0) > 0).sort((a, b) => (b[1].tulipnex || 0) - (a[1].tulipnex || 0));
    let tnxRank = tnxHolders.findIndex(u => u[0] === who);
    let isDireksi = tnxRank >= 0 && tnxRank <= 2;
    let direksiTitle = tnxRank === 0 ? 'CEO TULIPNEX' : tnxRank === 1 ? 'KOMISARIS UTAMA' : 'DIREKTUR EKSEKUTIF';

    let progress = Math.min(1, Math.max(0, (exp - min) / (max - min)));

    // 2. PROSES MENGGAMBAR KANVAS (1600x800)
    const width = 1600;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const COLOR_DOMINAN = '#242333';
    const COLOR_SEKUNDER = '#FD3E4D';
    const COLOR_WHITE = '#FFFFFF';

    // Latar Belakang Utama
    ctx.fillStyle = COLOR_DOMINAN;
    ctx.fillRect(0, 0, width, height);

    // Ornamen Banner Atas (Gradient Mask)
    let headerGrad = ctx.createLinearGradient(0, 0, 0, 300);
    headerGrad.addColorStop(0, 'rgba(253, 62, 77, 0.15)');
    headerGrad.addColorStop(1, 'rgba(36, 35, 51, 0)');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, 300);

    // --- PANEL UTAMA (LAYOUT LANDSCAPE) ---
    const panelY = 100;
    const panelH = 600;

    // 1. PANEL KIRI (BIODATA & PROFIL)
    drawGlassPanel(ctx, 50, panelY, 420, panelH, 30);
    
    // Avatar dengan Ring Bercahaya
    let pp = 'https://telegra.ph/file/24fa9020561f2513ee8bc.png';
    try { pp = await conn.profilePictureUrl(who, 'image') } catch (e) {}
    const avatar = await loadImage(pp).catch(() => loadImage('https://telegra.ph/file/24fa9020561f2513ee8bc.png'));

    // Outer Glow Avatar
    ctx.shadowBlur = 20;
    ctx.shadowColor = COLOR_SEKUNDER;
    ctx.save();
    ctx.beginPath(); ctx.arc(260, 280, 110, 0, Math.PI * 2); ctx.clip();
    ctx.drawImage(avatar, 150, 170, 220, 220);
    ctx.restore();
    ctx.shadowBlur = 0; // Reset shadow
    
    ctx.strokeStyle = COLOR_WHITE;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(260, 280, 115, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = COLOR_SEKUNDER;
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(260, 280, 125, 0, Math.PI * 2); ctx.stroke();

    // Nama & Jabatan
    ctx.textAlign = 'center';
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = 'bold 42px Montserrat-Black';
    ctx.fillText(registered ? name : await conn.getName(who), 260, 460);

    ctx.fillStyle = COLOR_SEKUNDER;
    ctx.font = 'bold 22px Montserrat';
    ctx.fillText(`[ ${isDireksi ? direksiTitle : role} ]`, 260, 505);

    // Level & Bar XP (Informative)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 24px Montserrat';
    ctx.fillText(`LEVEL ${level}`, 260, 580);

    // Bar XP dengan Efek Gradient
    let xpGrad = ctx.createLinearGradient(80, 0, 440, 0);
    xpGrad.addColorStop(0, '#FD3E4D');
    xpGrad.addColorStop(1, '#ff6b78');

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, 80, 610, 360, 30, 15, true);
    ctx.fillStyle = xpGrad;
    roundRect(ctx, 80, 610, Math.max(30, 360 * progress), 30, 15, true);

    ctx.fillStyle = COLOR_WHITE;
    ctx.font = 'bold 16px Montserrat';
    ctx.fillText(`${(exp - min).toLocaleString('id-ID')} / ${xp.toLocaleString('id-ID')} XP (${(progress * 100).toFixed(1)}%)`, 260, 675);
    ctx.textAlign = 'left';

    // 2. PANEL TENGAH (INVENTORI ASET)
    drawGlassPanel(ctx, 500, panelY, 520, panelH, 30);
    
    ctx.fillStyle = COLOR_WHITE;
    ctx.font = 'bold 28px Montserrat';
    ctx.fillText('INVENTORY LIST', 540, 160);
    ctx.fillStyle = COLOR_SEKUNDER;
    ctx.fillRect(540, 180, 60, 5);

    // Daftar Item Grid (2 Kolom)
    itemInventory.forEach((item, i) => {
        let col = i % 2;
        let row = Math.floor(i / 2);
        let x = 525 + (col * 245);
        let y = 220 + (row * 120);
        
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        roundRect(ctx, x, y, 225, 90, 20, true);
        ctx.strokeStyle = 'rgba(253, 62, 77, 0.3)';
        ctx.lineWidth = 1;
        roundRect(ctx, x, y, 225, 90, 20, false, true);

        ctx.fillStyle = COLOR_SEKUNDER;
        ctx.font = 'bold 22px Montserrat';
        ctx.fillText(item.label, x + 25, y + 35);
        
        ctx.fillStyle = COLOR_WHITE;
        ctx.font = '26px Montserrat';
        ctx.fillText(`${item.qty.toLocaleString('id-ID')}`, x + 25, y + 68);
        
        // Ikon Kecil Indikator
        ctx.fillStyle = COLOR_SEKUNDER;
        ctx.beginPath(); ctx.arc(x + 200, y + 45, 8, 0, Math.PI * 2); ctx.fill();
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '18px Montserrat';
    ctx.fillText('TOTAL ITEMS COLLECTED', 540, 630);
    ctx.fillStyle = COLOR_SEKUNDER;
    ctx.font = 'bold 36px Montserrat';
    ctx.fillText(`${totalItems.toLocaleString('id-ID')} UNIT`, 540, 675);

    // 3. PANEL KANAN (STATUS FINANSIAL)
    drawGlassPanel(ctx, 1050, panelY, 500, panelH, 30);

    ctx.fillStyle = COLOR_WHITE;
    ctx.font = 'bold 28px Montserrat';
    ctx.fillText('FINANCIAL STATUS', 1090, 160);
    ctx.fillStyle = COLOR_SEKUNDER;
    ctx.fillRect(1090, 180, 60, 5);

    const finStats = [
        { label: 'CASH', value: `Rp ${simplify(money)}` },
        { label: 'ASSET ESTIMATION', value: `Rp ${simplify(assetValue)}` },
        { label: 'TOTAL NETWORTH', value: `Rp ${simplify(networth)}`, special: true }
    ];

    finStats.forEach((stat, i) => {
        let y = 220 + (i * 155);
        
        ctx.fillStyle = stat.special ? 'rgba(253, 62, 77, 0.1)' : 'rgba(255,255,255,0.05)';
        roundRect(ctx, 1090, y, 420, 120, 20, true);

        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 18px Montserrat';
        ctx.fillText(stat.label, 1120, y + 45);

        ctx.fillStyle = stat.special ? COLOR_SEKUNDER : COLOR_WHITE;
        ctx.font = 'bold 44px Montserrat';
        ctx.fillText(stat.value, 1120, y + 95);
    });

    // --- FOOTER & BRANDING ---
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = 'italic 16px Montserrat';
    let sn = createHash('md5').update(who).digest('hex').substring(0, 24).toUpperCase();
    ctx.fillText(`SYSTEM STATUS: ONLINE | SECURITY_ID: ${sn}`, 50, 770);
    
    ctx.textAlign = 'right';
    ctx.fillText('TULIPNEX INTERFACE PROTOCOL V9.5.2', 1550, 770);

    const buffer = canvas.toBuffer();
    
    let caption = `*DASHBOARD USER*`;
    
    await conn.sendFile(m.chat, buffer, 'dashboard.png', caption, m);
};

handler.help = ['dashboard', 'dbd [@user]'];
handler.tags = ['info'];
handler.command = /^(dashboard|dbd)$/i;
handler.token = 5;

module.exports = handler;

// --- FUNGSI PEMBANTU ---

function drawGlassPanel(ctx, x, y, w, h, r) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    roundRect(ctx, x, y, w, h, r, true);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, r, false, true);
    
    // Ornamen Sudut Cyber
    ctx.fillStyle = '#FD3E4D';
    ctx.fillRect(x, y, 20, 4);
    ctx.fillRect(x, y, 4, 20);
    ctx.fillRect(x + w - 20, y + h - 4, 20, 4);
    ctx.fillRect(x + w - 4, y + h - 20, 4, 20);
}

function simplify(num) {
    if (!num) return '0';
    if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + 'T'
    if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'M'
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'JT'
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'RB'
    return num.toString()
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'undefined') radius = 5;
    if (typeof radius === 'number') radius = {tl: radius, tr: radius, br: radius, bl: radius};
    else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}