let handler = async (m, { conn, args, command }) => {
    conn.reply(m.chat, `https://docs.google.com/spreadsheets/d/1srL6tBVqsKZ-K0MRUy4OaIYnlCWcLLpA1W_V1QdoLsQ/edit?usp=sharing`,m)
        }
handler.help = ['linkxlsx']
handler.tags = ['asisten']
handler.command = /^(linklaporan|linkxlsx)$/i 
handler.limit = false
handler.group = false


module.exports = handler