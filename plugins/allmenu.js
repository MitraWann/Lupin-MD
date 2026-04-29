/**
 * Nama Plugin: All Menu & Plugin Detector
 * Deskripsi: Mendeteksi dan mengkategorikan seluruh command & plugin yang berjalan di memory.
 * Author: Senior Bot Developer
 */

let handler = async (m, { conn, usedPrefix, command, text }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '🔎', key: m.key } });

        let plugins = global.plugins;
        let menu = {};
        let passiveList = [];
        let hiddenList = [];
        let totalCommands = 0;
        let totalPlugins = 0;

        // Looping untuk membedah seluruh plugin yang termuat di memori
        for (let [filename, plugin] of Object.entries(plugins)) {
            if (!plugin || plugin.disabled) continue;
            totalPlugins++;

            // Menentukan Tag/Kategori (Jika tidak ada, masuk ke Uncategorized)
            let tags = plugin.tags || ['uncategorized'];
            if (!Array.isArray(tags)) tags = [tags];

            // Menentukan Daftar Command (Help)
            let helps = plugin.help || [];
            let isHidden = false;
            let isPassive = false;
            
            // Jika tidak ada array help, tapi ada regex command (Hidden Command)
            if (helps.length === 0 && plugin.command) {
                isHidden = true;
                let cmdStr = plugin.command instanceof RegExp 
                    ? plugin.command.source.replace(/[\^$|]/g, '').replace(/\\b/g, '') // Bersihkan regex dasar
                    : plugin.command.toString();
                helps = [cmdStr + ' (Hidden)'];
            }

            // Jika sama sekali tidak ada command (Biasanya Plugin Pasif / Auto-Respon / Event Handler)
            if (helps.length === 0) {
                isPassive = true;
                helps = ['[Plugin Pasif / Event Handler]'];
                if (!passiveList.includes(filename)) passiveList.push(filename);
            }

            if (!Array.isArray(helps)) helps = [helps];

            // Memasukkan ke dalam struktur objek menu
            for (let tag of tags) {
                let category = tag.toLowerCase();
                if (!menu[category]) menu[category] = [];
                
                for (let help of helps) {
                    if (isHidden) {
                        if (!hiddenList.some(h => h.cmd === help && h.file === filename)) {
                            hiddenList.push({ cmd: help, file: filename });
                        }
                    } else if (!isPassive) {
                        totalCommands++; // Hanya hitung command publik/normal
                    }
                    
                    menu[category].push({
                        cmd: help,
                        file: filename,
                        isHidden: isHidden,
                        isPassive: isPassive
                    });
                }
            }
        }

        // Memproses Input Kategori
        let input = text ? text.trim().toLowerCase() : '';
        let outputText = '';

        if (!input || input === 'list') {
            // VIEW 1: Menampilkan Daftar Kategori Saja (Default)
            outputText += `🤖 *DATABASE SISTEM: KATEGORI COMMAND*\n\n`;
            outputText += `Gunakan perintah *${usedPrefix}${command} <kategori>* untuk melihat menu.\n`;
            outputText += `Contoh: *${usedPrefix}${command} downloader*\n\n`;
            
            outputText += `📊 *Statistik Sistem:*\n`;
            outputText += `◦ Total Command: ${totalCommands}\n`;
            outputText += `◦ Total Plugin: ${totalPlugins}\n\n`;
            
            let sortedCategories = Object.keys(menu).sort((a, b) => {
                if (a === 'uncategorized') return 1;
                if (b === 'uncategorized') return -1;
                return a.localeCompare(b);
            });

            outputText += `📁 *KATEGORI TERSEDIA:*\n`;
            outputText += `┌ ◦ all\n`;
            for (let category of sortedCategories) {
                outputText += `├ ◦ ${category}\n`;
            }
            outputText += `└ ◦ (Total ${sortedCategories.length} Kategori)\n\n`;

            outputText += `🕵️‍♂️ *KATEGORI KHUSUS:*\n`;
            outputText += `┌ ◦ hidden (${hiddenList.length} Command)\n`;
            outputText += `└ ◦ passive (${passiveList.length} Plugin)\n\n`;
            
            outputText += `> 💻 *Script:* RTXZY-MD Engine`;

        } else if (input === 'passive') {
            // VIEW 2: Menampilkan Plugin Pasif
            outputText += `🤖 *DAFTAR PLUGIN PASIF / EVENT HANDLER*\n\n`;
            outputText += `_Plugin ini berjalan secara otomatis di latar belakang tanpa memerlukan trigger command._\n\n`;
            outputText += `┌── *[ PASSIVE PLUGINS ]*\n`;
            for (let file of passiveList.sort()) {
                outputText += `│ ◦ 📄 _${file}_\n`;
            }
            outputText += `└───────\n`;

        } else if (input === 'hidden') {
            // VIEW 3: Menampilkan Command Hidden
            outputText += `🤖 *DAFTAR COMMAND TERSEMBUNYI (HIDDEN)*\n\n`;
            outputText += `_Command ini menggunakan deteksi Regex murni tanpa label help/menu._\n\n`;
            outputText += `┌── *[ HIDDEN COMMANDS ]*\n`;
            let sortedHidden = hiddenList.sort((a,b) => a.cmd.localeCompare(b.cmd));
            for (let item of sortedHidden) {
                outputText += `│ ◦ ${item.cmd}\n`;
                outputText += `│   └ 📄 _${item.file}_\n`;
            }
            outputText += `└───────\n`;

        } else if (input === 'all') {
            // VIEW 4: Menampilkan Semua Command (Format Lama)
            outputText += `🤖 *DATABASE SISTEM: SEMUA COMMAND*\n\n`;
            let sortedCategories = Object.keys(menu).sort((a, b) => {
                if (a === 'uncategorized') return 1;
                if (b === 'uncategorized') return -1;
                return a.localeCompare(b);
            });

            for (let category of sortedCategories) {
                outputText += `┌── *[ ${category.toUpperCase()} ]*\n`;
                let sortedCommands = menu[category].sort((a, b) => a.cmd.localeCompare(b.cmd));
                for (let item of sortedCommands) {
                    let prefixTampil = item.cmd.includes('[Plugin Pasif') ? '' : usedPrefix;
                    outputText += `│ ◦ ${prefixTampil}${item.cmd} \n`;
                    outputText += `│   └ 📄 _${item.file}_\n`;
                }
                outputText += `└───────\n\n`;
            }
        } else if (menu[input]) {
            // VIEW 5: Menampilkan Command Berdasarkan Kategori
            outputText += `🤖 *KATEGORI MENU: ${input.toUpperCase()}*\n\n`;
            outputText += `┌── *[ ${input.toUpperCase()} ]*\n`;
            let sortedCommands = menu[input].sort((a, b) => a.cmd.localeCompare(b.cmd));
            for (let item of sortedCommands) {
                let prefixTampil = item.cmd.includes('[Plugin Pasif') ? '' : usedPrefix;
                outputText += `│ ◦ ${prefixTampil}${item.cmd} \n`;
                outputText += `│   └ 📄 _${item.file}_\n`;
            }
            outputText += `└───────\n`;
        } else {
            // VIEW 6: Kategori Tidak Ditemukan
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ Kategori *${input}* tidak ditemukan!\n\nKetik *${usedPrefix}${command}* untuk melihat daftar kategori.`);
        }

        // Mengirimkan hasil output
        await conn.sendMessage(m.chat, { text: outputText }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply(`${global.eror}\n\nTerjadi kesalahan saat memindai direktori plugin!`);
    }
}

// Konfigurasi Metadata Plugin
handler.help = ['allfitur'];
handler.tags = ['owner'];
handler.command = /^(allfitur)$/i;
handler.owner = true; 
handler.private = true;

module.exports = handler;