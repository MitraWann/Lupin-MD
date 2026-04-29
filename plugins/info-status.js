let { performance } = require('perf_hooks')
let osu = require('node-os-utils')

let handler = async(m, { conn, command, usedPrefix, DevMode }) => {
    try {
        let NotDetect = 'Not Detect'
        let old = performance.now()
        let cpu = osu.cpu
        let cpuCore = cpu.count()
        let drive = osu.drive
        let mem = osu.mem
        let netstat = osu.netstat
        let OS = osu.os.platform()
        let cpuModel = cpu.model()

        let cpuPer
        let p1 = cpu.usage().then(cpuPercentage => {
            cpuPer = cpuPercentage
        }).catch(() => {
            cpuPer = NotDetect
        })

        let driveTotal, driveUsed, drivePer
        let p2 = drive.info().then(info => {
            driveTotal = (info.totalGb + ' GB')
            driveUsed = info.usedGb
            drivePer = (info.usedPercentage + '%')
        }).catch(() => {
            driveTotal = NotDetect
            driveUsed = NotDetect
            drivePer = NotDetect
        })

        let ramTotal, ramUsed
        let p3 = mem.info().then(info => {
            ramTotal = info.totalMemMb
            ramUsed = info.usedMemMb
        }).catch(() => {
            ramTotal = NotDetect
            ramUsed = NotDetect
        })

        let netsIn, netsOut
        let p4 = netstat.inOut().then(info => {
            netsIn = (info.total.inputMb + ' MB')
            netsOut = (info.total.outputMb + ' MB')
        }).catch(() => {
            netsIn = NotDetect
            netsOut = NotDetect
        })

        await Promise.all([p1, p2, p3, p4])
        
        let _ramTotal = (ramTotal + ' MB')
        let neww = performance.now()
        
        // Kalkulasi persentase RAM yang dirapikan
        let ramPercent = (/[0-9.+/]/g.test(ramUsed) && /[0-9.+/]/g.test(ramTotal)) ? Math.round(100 * (ramUsed / ramTotal)) + '%' : NotDetect

        // Desain UI Baru (Tanpa Reaksi Emoji)
        var txt = `🖥️ *S Y S T E M   S T A T U S*
────────────────────

📊 *H A R D W A R E*
» *OS Platform:* ${OS}
» *CPU Model:* ${cpuModel.trim()}
» *CPU Core:* ${cpuCore} Cores
» *CPU Usage:* ${cpuPer}%

💾 *M E M O R Y   &   S T O R A G E*
» *RAM Usage:* ${ramUsed} / ${_ramTotal} (${ramPercent})
» *Drive Usage:* ${driveUsed} / ${driveTotal} (${drivePer})

🌐 *N E T W O R K   &   S P E E D*
» *Ping / Latency:* ${Math.round(neww - old)} ms
» *Internet IN:* ${netsIn}
» *Internet OUT:* ${netsOut}`

        conn.relayMessage(m.chat, {
            extendedTextMessage:{
                text: txt, 
                contextInfo: {
                    externalAdReply: {
                        title: `STATUS MONITORING - WANN BOT`,
                        body: `Powered by TulipNex`,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        thumbnailUrl: 'https://files.catbox.moe/mrfys5.jpg',
                        sourceUrl: ''
                    }
                }, mentions: [m.sender]
            }
        }, {})

    } catch (e) {
        console.log(e)
        m.reply('⚠️ Terjadi kesalahan saat memuat status sistem.')
        
        if (DevMode) {
            for (let jid of global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').filter(v => v != conn.user.jid)) {
                conn.reply(jid, 'Status.js error\nNo: *' + m.sender.split(`@`)[0] + '*\nCommand: *' + m.text + '*\n\n*' + e + '*', m)
            }
        }
    }
}

handler.help = ['status'].map(v => 'status' + v)
handler.tags = ['info']
handler.command = /^(status|botstat|botstatusbot|statusbot)$/i

module.exports = handler