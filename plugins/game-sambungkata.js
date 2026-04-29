const { sKata, cKata } = require('.././lib/sambung-kata');

const game = `• *S A M B U N G - K A T A*\n\n> Game Kata Bersambung adalah permainan yang dimana setiap pemainnya diharuskan membuat kata dari akhir kata yang berasal dari kata sebelumnya.`.trim();

const rules = `• *R U L E S*\n- Jawaban merupakan kata dasar (KBBI)\n- Tidak mengandung spasi\n- Tanpa kata imbuhan (me-, -an, dll).\n\n> 🎁 *S I S T E M  H A D I A H*\n> - Tiap jawaban benar: *+500-600 XP*\n> - Pemain terakhir yang bertahan\n> akan memborong semua *Jackpot XP*!\n\n- .skata untuk join\n- .skata start untuk memulai`.trim();

let handler = async (m, { conn, text, isPrems, isROwner, usedPrefix, command }) => {
    let isDebug = /debug/i.test(command) && isROwner;
    conn.skata = conn.skata ? conn.skata : {};
    let id = m.chat;
    let kata = await genKata();
    
    let room_all = Object.values(conn.skata).find(room => room.id !== id && room.player.includes(m.sender));
    if (room_all) throw `Kamu sedang bermain sambung kata di chat lain, selesaikan game kamu terlebih dahulu!`;
    
    if (id in conn.skata) {
        let room = conn.skata[id];
        let member = room.player;
        
        if (room.status == 'play') {
            if (!room.waktu._destroyed && !room.diam) {
                let tagSender = `@${m.sender.replace(/@.+/, '')}`;
                return conn.sendMessage(m.chat, {
                    text: `Hii ${tagSender}, Masih ada game berlangsung di chat ini\nTunggu hingga game berakhir lalu ikut bergabung!`,
                    mentions: [m.sender],
                    contextInfo: { mentionedJid: [m.sender] }
                }, { quoted: m }).catch(e => { return !1 });
            }
            clearTimeout(room.waktu); // PERBAIKAN: Matikan timer bocor
            delete conn.skata[id];
        }
        
        if (text == 'start' && room.status == 'wait') {
            if (!member.includes(m.sender)) return m.reply('Kamu belum ikut bergabung di list!');
            if (member.length < 2) throw `Minimal harus ada 2 orang player!`;
            
            room.curr = member[0];
            room.status = 'play';
            room.win_point = 100;
            
            for (let i of room.player) {
                let user = global.db.data.users[i];
                if (!('skata' in user)) user.skata = 0;
            }
            clearTimeout(room.waktu_list);
            
            let tagCurr = `@${room.curr.replace(/@.+/, '')}`;
            room.chat = await conn.sendMessage(m.chat, {
                text: `🎮 *GAME DIMULAI*\n\nSaatnya ${tagCurr}\nMulai : *${(room.kata).toUpperCase()}*\n*${room.filter(room.kata).toUpperCase()}... ?*\n\n_Jawab dengan mengetik langsung!_\n_"nyerah" untuk menyerah_\nTotal: ${member.length} Player`,
                mentions: member,
                contextInfo: { mentionedJid: member }
            }, { quoted: m });

            // ==========================================
            // PERBAIKAN: FAILSAFE PADA TIMER
            // ==========================================
            room.timer = function() {
                clearTimeout(room.waktu);
                room.waktu = setTimeout(async () => {
                    // JURUS KEBAL: Cegah eksekusi jika room sudah dihapus
                    if (!conn.skata[room.id]) return; 
                    if (!room.curr) return; 

                    let tagDead = `@${room.curr.replace(/@.+/, '')}`;
                    await conn.sendMessage(room.id, {
                        text: `⏱️ Waktu jawab habis!\n${tagDead} tereliminasi dari permainan.`,
                        mentions: [room.curr],
                        contextInfo: { mentionedJid: [room.curr] }
                    });
                    
                    room.eliminated.push(room.curr);
                    let index = room.player.indexOf(room.curr);
                    // Cegah splice memotong data sembarangan jika player tidak ditemukan
                    if (index !== -1) room.player.splice(index, 1); 
                    
                    // Cek jika tersisa 1 pemenang
                    if (room.player.length === 1) {
                        global.db.data.users[room.player[0]].exp += room.win_point;
                        let tagWin = `@${room.player[0].replace(/@.+/, '')}`;
                        await conn.sendMessage(room.id, {
                            text: `🏆 *GAME BERAKHIR*\n\n${tagWin} Berhasil bertahan dan Menang!\n🎁 Hadiah: +${room.win_point} XP`,
                            mentions: [room.player[0]],
                            contextInfo: { mentionedJid: [room.player[0]] }
                        });
                        clearTimeout(room.waktu); // Matikan timer!
                        delete conn.skata[room.id];
                        return;
                    }
                    
                    // Lanjut ke pemain berikutnya
                    room.curr = room.player[0];
                    let _kata = await room.genKata();
                    room.kata = _kata;
                    room.basi = [];
                    
                    let tagNext = `@${room.curr.replace(/@.+/, '')}`;
                    room.chat = await conn.sendMessage(room.id, {
                        text: `Lanjut! Giliran ${tagNext}\nMulai : *${_kata.toUpperCase()}*\n*${room.filter(_kata).toUpperCase()}... ?*\n\n_Jawab dengan mengetik langsung!_\n_"nyerah" untuk menyerah_`,
                        mentions: room.player,
                        contextInfo: { mentionedJid: room.player }
                    });
                    
                    room.timer(); // Restart timer
                }, 45000);
            };
            
            room.timer(); // Jalankan timer pertama kali

        } else if (room.status == 'wait') {
            if (member.includes(m.sender)) throw `Kamu sudah ikut di list!`;
            member.push(m.sender);
            clearTimeout(room.waktu_list);
            
            room.waktu_list = setTimeout(() => {
                conn.sendMessage(m.chat, { text: `⏳ Waktu tunggu habis. Sambung kata dibatalkan otomatis.` }).then(() => { delete conn.skata[id] });
            }, 120000);
            
            let playerList = member.map((v, i) => `- ${i + 1}. @${v.replace(/@.+/, '')}`).join('\n');
            let caption = `• *L I S T - P L A Y E R*\n${playerList}\n\nSambung kata akan dimainkan secara bergiliran.`.trim();
            
            room.chat = await conn.sendMessage(m.chat, {
                text: `${caption}\n\nKetik:\n*${usedPrefix + command}* untuk join\n*${usedPrefix + command} start* untuk mulai`,
                mentions: member,
                contextInfo: { mentionedJid: member }
            }, { quoted: m });
        }
    } else {
        // Buat room baru
        conn.skata[id] = {
            id,
            player: isDebug ? ([global.owner[0] + '@s.whatsapp.net', conn.user.jid, global.owner[0] + '@s.whatsapp.net']) : [],
            status: 'wait',
            eliminated: [],
            basi: [],
            diam: false,
            win_point: 0,
            curr: '',
            kata,
            filter,
            genKata,
            chat: await conn.sendMessage(m.chat, { text: `${game}\n\n${rules}` }, { quoted: m }),
            waktu: false,
            waktu_list: false,
            timer: null
        };
    }
};

handler.help = ['sambungkata'];
handler.tags = ['game'];
handler.command = /^(sambungkata|skata)$/i;
handler.limit = true;
handler.group = true;

module.exports = handler;

async function genKata() {
    let json = await sKata();
    let result = json.kata;
    while (result.length < 3 || result.length > 7) {
        json = await sKata();
        result = json.kata;
    }
    return result;
}

function filter(text) {
    let mati = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
    let misah;
    if (text.length < 3) return text;
    if (/([qwrtypsdfghjklzxcvbnm][qwrtypsdfhjklzxcvbnm])$/.test(text)) {
        let mid = /([qwrtypsdfhjklzxcvbnm])$/.exec(text)[0];
        return mid;
    }
    if (/([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.test(text)) {
        let mid = /([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.exec(text)[0];
        return mid;
    }
    else if (/([aiueo][aiueo]([qwrtypsdfghjklzxcvbnm]|ng)?)$/i.test(text)) {
        if (/(ng)$/i.test(text)) return text.substring(text.length - 3); 
        else if (/([qwrtypsdfghjklzxcvbnm])$/i.test(text)) return text.substring(text.length - 2);
        else return text.substring(text.length - 1);
    }
    else if (/n[gy]([aiueo]([qwrtypsdfghjklzxcvbnm])?)$/.test(text)) {
        let nyenye = /n[gy]/i.exec(text)[0];
        misah = text.split(nyenye);
        return nyenye + misah[misah.length - 1];
    }
    else {
        let res = Array.from(text).filter(v => mati.includes(v));
        let resu = res[res.length - 1];
        for (let huruf of mati) {
            if (text.endsWith(huruf)) {
                resu = res[res.length - 2];
            }
        }
        misah = text.split(resu);
        if (text.endsWith(resu)) {
            return resu + misah[misah.length - 2] + resu;
        }
        return resu + misah[misah.length - 1];
    }
}