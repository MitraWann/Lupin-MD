var { totalmem, freemem } = require('os')
var os = require("os");
var util = require("util");
var osu = require("node-os-utils");
var { performance } = require("perf_hooks");
var { sizeFormatter } = require("human-readable");

var format = sizeFormatter({
  std: "JEDEC", 
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

var handler = async (m, { conn }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us')) 
  const used = process.memoryUsage()
  
  const cpus = os.cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
    return cpu
  })
  
  const cpu = cpus.reduce(
    (last, cpu, _, { length }) => {
      last.total += cpu.total;
      last.speed += cpu.speed / length;
      last.times.user += cpu.times.user;
      last.times.nice += cpu.times.nice;
      last.times.sys += cpu.times.sys;
      last.times.idle += cpu.times.idle;
      last.times.irq += cpu.times.irq;
      return last;
    },
    {
      speed: 0,
      total: 0,
      times: {
        user: 0,
        nice: 0,
        sys: 0,
        idle: 0,
        irq: 0,
      },
    }
  );
  
  var _muptime
    if (process.send) {
      process.send('uptime')
      _muptime = await new Promise(resolve => {
        process.once('message', resolve)
        setTimeout(resolve, 1000)
      }) * 1000
    }
    
  var muptime = clockString(_muptime)
  var old = performance.now();
  var neww = performance.now();
  var speed = neww - old;
  
  var cpux = osu.cpu
  var cpuCore = cpux.count()
  var HostN = osu.os.hostname()
  var OS = osu.os.platform()
  
  var d = new Date(new Date + 3600000)
  var locale = 'id'
  var times = d.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })

  await m.reply('_Connecting to server..._')

  var txt = `🚀 *S P E E D  &  S T A T U S*
────────────────────
⚡ *Ping:* ${Math.round(neww - old)} ms
⏱️ *Runtime:* ${muptime}

📊 *C H A T S   I N F O*
────────────────────
💬 *Groups:* ${groupsIn.length}
👤 *Personal:* ${chats.length - groupsIn.length}
🌐 *Total:* ${chats.length}

⚙️ *S E R V E R   I N F O*
────────────────────
🖥️ *Platform:* ${OS.toUpperCase()} - ${HostN}
🧠 *CPU:* ${require('os').cpus()[0].model}
💾 *RAM Used:* ${format(totalmem() - freemem())} / ${format(totalmem())}
🟢 *RAM Free:* ${format(freemem())}
⏰ *Time:* ${times} WITA

📉 *N O D E   M E M O R Y*
────────────────────
${
  "```\n" +
  Object.keys(used)
    .map(
      (key, _, arr) =>
        `${key.padEnd(Math.max(...arr.map((v) => v.length)), " ")} : ${format(used[key])}`
    )
    .join("\n") +
  "\n```"
}

${
  cpus[0]
    ? `📈 *T O T A L   C P U   U S A G E*
────────────────────
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${
  "```\n" +
  Object.keys(cpu.times)
        .map(
          (type) =>
            `- ${(type.toUpperCase()).padEnd(6)}: ${(
              (100 * cpu.times[type]) / cpu.total
            ).toFixed(2)}%`
        )
        .join("\n") +
  "\n```"
}

🧩 *C O R E   U S A G E   (${cpus.length} Cores)*
────────────────────\n${cpus
  .map(
    (cpu, i) =>
      `*Core [${i + 1}]* - ${cpu.speed} MHZ\n${
        "```\n" +
        Object.keys(cpu.times)
        .map(
          (type) =>
            `  ${(type.toUpperCase()).padEnd(6)}: ${(
              (100 * cpu.times[type]) / cpu.total
            ).toFixed(2)}%`
        )
        .join("\n") +
        "\n```"
      }`
  )
  .join("\n\n")}`
    : ""
}`

  conn.relayMessage(m.chat, {
    extendedTextMessage:{
        text: txt, 
        contextInfo: {
            externalAdReply: {
                title: `SERVER MONITORING - WANN BOT`,
                body: `${require('os').cpus()[0].model}`,
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: 'https://files.catbox.moe/mrfys5.jpg',
                sourceUrl: ''
            }
        }, mentions: [m.sender]
    }
  }, {})
}

handler.help = ['infobot', 'infoserver'];
handler.tags = ['info'];
handler.command = /^(infobot|info|ingfo)$/i
module.exports = handler;

function clockString(ms) {
  var d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  var h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  var m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  var s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'D ', h, 'H ', m, 'M ', s, 'S '].map(v => v.toString().padStart(2, 0)).join('')
}