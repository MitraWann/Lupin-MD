let handler = async(m, { conn }) => {
    const jkt = [
        'https://image2url.com/r2/default/images/1771066668324-bf4a9148-dcb5-40af-870f-594bdd572d4b.png'
    ]
    let capt = `Teks Disini`
    try {
      const url = pickRandom(jkt)
      await conn.sendMessage(m.chat, {
        react: {
            text: '💳',
            key: m.key,
        }
    })
      await conn.sendFile(m.chat, url, null, capt, '', m);
    } catch (e) {
      console.log(e);
      m.reply('Maaf, saat ini payment tidak tersedia. \nCoba lagi beberapa saat.');
      await conn.sendMessage(m.chat, {
        react: {
            text: '😞',
            key: m.key,
        }
    })
    }
  }
  
  handler.help = ['payment']
  handler.command = /^payment$/i
  handler.owner = false
  handler.premium = false
  handler.group = true
  handler.private = false
  
  function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
  }
  
  module.exports = handler
  