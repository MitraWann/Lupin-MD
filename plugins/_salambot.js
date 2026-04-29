let handler = async (m, { conn, args, command }) => {
    conn.reply(m.chat, `Waalaikumsalam`,m)
        }

handler.customPrefix = /^(assalamualaikum|assalamu'alaikum)$/i 
handler.command = new RegExp
handler.limit = false
handler.group = false


module.exports = handler