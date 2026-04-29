/**
 * Plugin: Notification Ganti Tag/Label
 * Adapted for Baileys Base Framework
 */

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isAdmin }) => {
    // 1. Ambil data grup dari database global
    let chat = global.db.data.chats[m.chat];
    const sub = args[0]?.toLowerCase();
    const sub2 = args[1]?.toLowerCase();
    const currentStatus = chat.notifLabelChange === true;

    // 2. Logika untuk "Global ON" (Khusus Owner)
    if (sub === 'on' && sub2 === 'all') {
        if (!isOwner) return m.reply(`❌ Hanya *Owner* yang bisa mengaktifkan fitur ini secara global!`);
        
        try { await conn.sendMessage(m.chat, { react: { text: '🕕', key: m.key } }); } catch (e) {}
        
        let count = 0;
        let groups = Object.keys(global.db.data.chats).filter(jid => jid.endsWith('@g.us'));
        for (let jid of groups) {
            global.db.data.chats[jid].notifLabelChange = true;
            count++;
        }
        
        try { await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); } catch (e) {}
        return m.reply(
            `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
            `> Notifikasi ganti label diaktifkan di *${count}* grup!`
        );
    }

    // 3. Logika untuk "Global OFF" (Khusus Owner)
    if (sub === 'off' && sub2 === 'all') {
        if (!isOwner) return m.reply(`❌ Hanya *Owner* yang bisa mematikan fitur ini secara global!`);
        
        try { await conn.sendMessage(m.chat, { react: { text: '🕕', key: m.key } }); } catch (e) {}
        
        let count = 0;
        let groups = Object.keys(global.db.data.chats).filter(jid => jid.endsWith('@g.us'));
        for (let jid of groups) {
            global.db.data.chats[jid].notifLabelChange = false;
            count++;
        }
        
        try { await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); } catch (e) {}
        return m.reply(
            `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
            `> Notifikasi ganti label dinonaktifkan di *${count}* grup!`
        );
    }

    // 4. Batasan Admin Grup (Untuk perintah biasa)
    if (!isAdmin && !isOwner) {
        return m.reply(global.dfail('admin', m, conn));
    }

    // 5. Logika untuk "Group ON"
    if (sub === 'on') {
        if (currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
                `> Status: *✅ ON*\n` +
                `> Notifikasi ganti label sudah aktif di grup ini.\n\n` +
                `_Gunakan \`${usedPrefix}${command} off\` untuk menonaktifkan._`
            );
        }
        chat.notifLabelChange = true;
        return m.reply(
            `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀᴋᴛɪꜰ*\n\n` +
            `> Notifikasi perubahan label member berhasil diaktifkan!\n` +
            `> Bot akan memberitahu ketika ada member yang labelnya diganti.\n\n` +
            `_Contoh: Admin menambahkan tag "VIP" ke member_`
        );
    }

    // 6. Logika untuk "Group OFF"
    if (sub === 'off') {
        if (!currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
                `> Status: *❌ OFF*\n` +
                `> Notifikasi ganti label sudah nonaktif di grup ini.\n\n` +
                `_Gunakan \`${usedPrefix}${command} on\` untuk mengaktifkan._`
            );
        }
        chat.notifLabelChange = false;
        return m.reply(
            `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
            `> Notifikasi perubahan label member berhasil dinonaktifkan.`
        );
    }

    // 7. Menu Bantuan Default
    m.reply(
        `🏷️ *ɴᴏᴛɪꜰ ɢᴀɴᴛɪ ᴛᴀɢ/ʟᴀʙᴇʟ*\n\n` +
        `> Status: *${currentStatus ? '✅ ON' : '❌ OFF'}*\n\n` +
        `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
        `> \`${usedPrefix}${command} on\` → Aktifkan (Grup ini)\n` +
        `> \`${usedPrefix}${command} off\` → Nonaktifkan (Grup ini)\n` +
        `> \`${usedPrefix}${command} on all\` → Global ON (Owner)\n` +
        `> \`${usedPrefix}${command} off all\` → Global OFF (Owner)\n\n` +
        `> 📋 *Fitur ini akan memberitahu saat:*\n` +
        `> • Admin menambahkan label ke member\n` +
        `> • Admin menghapus label dari member\n` +
        `> • Label member berubah`
    );
};

// ==========================================
// EVENT INTERCEPTOR (Menangkap perubahan Label)
// ==========================================
handler.before = async function (m, { conn }) {
    if (!m.isGroup) return false;
    
    let chat = global.db.data.chats[m.chat];
    if (!chat) return false;

    // Mendeteksi Protobuf tipe 30 (Protokol khusus Label/Tag WA)
    const protocolMessage = m.message?.protocolMessage || m.msg?.protocolMessage;
    if (!protocolMessage || protocolMessage.type !== 30) return false;
    
    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;

    const participant = m.sender; // Orang yang mengalami perubahan label
    const label = memberLabel.label || '';

    // Mengambil Foto Profil User (Jika diprivasi, pakai fallback default)
    let ppUrl;
    try {
        ppUrl = await conn.profilePictureUrl(participant, 'image');
    } catch (e) {
        ppUrl = 'https://telegra.ph/file/70e8de9b1879568954f09.jpg'; // Gambar default jika PP disembunyikan
    }

    // Integrasi dengan Anti-Toxic Bawaan (Menghindari dependency terputus)
    if (chat.antiToxic && label.trim()) {
        const toxicWords = ['anjing', 'babi', 'monyet', 'bangsat', 'kontol', 'memek', 'ngentot']; // Ganti dengan array toxic database Anda jika ada
        const isToxic = toxicWords.some(word => label.toLowerCase().includes(word));
        
        if (isToxic) {
            await conn.sendMessage(m.chat, { 
                text: `Hei @${participant.split('@')[0]}, Tag/Label kamu mengandung kata kasar (toxic)!`,
                mentions: [participant],
                contextInfo: {
                    mentionedJid: [participant],
                    externalAdReply: {
                        title: "⚠️ LABEL WARNING: TOXIC",
                        body: "Terdeteksi pelanggaran kata kasar",
                        thumbnailUrl: ppUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            });
            return true;
        }
    }

    // Cek apakah fitur Notifikasi diaktifkan di grup ini
    if (chat.notifLabelChange !== true) return false;

    // Susun Teks
    let notifText = '';
    if (label.trim()) {
        notifText = `🎉 @${participant.split('@')[0]} telah mengubah label menjadi *${label}*`;
    } else {
        notifText = `🥗 @${participant.split('@')[0]} telah menghapus label`;
    }

    // Kirim notifikasi
    await conn.sendMessage(m.chat, { 
        text: notifText,
        mentions: [participant],
        contextInfo: {
            mentionedJid: [participant],
            externalAdReply: {
                title: "INFO LABEL GRUP",
                body: "Pembaruan Tag/Label Member",
                thumbnailUrl: ppUrl,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    return true;
};

// ==========================================
// METADATA PLUGIN
// ==========================================
handler.help = ['notifgantitag'].map(v => v + ' <on/off>');
handler.tags = ['group'];
handler.command = /^(notifgantitag|notiflabel|notiftag|labeltag)$/i;

handler.group = true; 
// Catatan: handler.admin = true tidak dipasang di sini agar owner bisa menggunakan 
// perintah 'on all' di grup mana saja tanpa harus menjadi admin. 
// Proteksi admin sudah dilakukan di dalam blok kode (baris 41).

module.exports = handler;