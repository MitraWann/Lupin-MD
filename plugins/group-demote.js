let handler = async (m, { teks, conn, isOwner, isAdmin, args, command }) => {
    if (m.isBaileys) return;
    
    if (!(isAdmin || isOwner)) {
        global.dfail('admin', m, conn);
        throw false;
    }

    let ownerGroup = m.chat.split`-`[0] + "@s.whatsapp.net";
    let users = [];

    // Mengambil target dari reply atau mention
    if (m.quoted) {
        if (m.quoted.sender === ownerGroup || m.quoted.sender === conn.user.jid) return;
        users = [m.quoted.sender];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        users = m.mentionedJid;
    } else {
        throw 'Tag siapa yang ingin diturunkan jabatannya?';
    }

    // Filter agar tidak demote diri sendiri atau owner grup
    users = users.filter(u => !(u == ownerGroup || u.includes(conn.user.jid)));

    if (users.length === 0) return m.reply('Tidak ada user valid yang bisa didemote!');

    for (let user of users) {
        if (user.endsWith("@s.whatsapp.net")) {
            try {
                // Eksekusi demote
                await conn.groupParticipantsUpdate(m.chat, [user], "demote");
                
                // ==========================================
                // PERBAIKAN: FORMAT TAG & BOM TAG
                // ==========================================
                let tag = `@${user.replace(/@.+/, '')}`;
                let mentionedJid = [user];

                await conn.sendMessage(m.chat, { 
                    text: `✅ Sukses ${command} ${tag}!`, 
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

handler.help = ['demote @user'];
handler.tags = ['group', 'owner'];
handler.command = /^(demo?te|\↓)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;
handler.fail = null;

module.exports = handler;