let handler = async (m, { teks, conn, isOwner, isAdmin, args, command }) => {
    if (m.isBaileys) return;
    
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
    }

    let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";
    let users = [];

    // Mengambil target dari reply pesan atau mention (@tag)
    if (m.quoted) {
        if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid) return;
        users = [m.quoted.sender];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        users = m.mentionedJid;
    } else {
        throw 'Tag atau reply siapa yang ingin dinaikkan jabatannya?';
    }

    // Filter agar tidak memproses owner grup atau bot itu sendiri
    users = users.filter(u => !(u == ownerGroup || u.includes(conn.user.jid)));

    if (users.length === 0) return m.reply('Tidak ada user valid yang bisa dipromote!');

    for (let user of users) {
        if (user.endsWith("@s.whatsapp.net")) {
            try {
                // Eksekusi menaikkan jabatan jadi admin
                await conn.groupParticipantsUpdate(m.chat, [user], "promote");
                
                // ==========================================
                // PERBAIKAN: FORMAT TAG BERSIH & BOM TAG
                // ==========================================
                let tag = `@${user.replace(/@.+/, '')}`;
                let mentionedJid = [user];

                await conn.sendMessage(m.chat, { 
                    text: `✅ Sukses ${command} ${tag} menjadi Admin!`, 
                    mentions: mentionedJid,
                    contextInfo: { mentionedJid }
                }, { quoted: m });

            } catch (e) {
                console.error(e);
                let tag = `@${user.replace(/@.+/, '')}`;
                let mentionedJid = [user];

                await conn.sendMessage(m.chat, { 
                    text: `❌ Gagal ${command} ${tag}!`, 
                    mentions: mentionedJid,
                    contextInfo: { mentionedJid }
                }, { quoted: m });
            }
        }
    }
};

handler.help = ['promote @user'];
handler.tags = ['group', 'owner'];
handler.command = /^(promote|admin|\^)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
handler.fail = null;

module.exports = handler;