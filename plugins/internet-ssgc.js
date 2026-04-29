//ssgcip created by nazir
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");


async function getPPGrup(inviteLink) {
  const { data } = await axios.get(inviteLink, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  });
  const $ = cheerio.load(data);
  return $('meta[property="og:image"]').attr("content") || null;
}

async function urlToBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

function getInviteCode(link) {
  return link.split("chat.whatsapp.com/")[1]?.split("?")[0];
}

const handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw "❌ Command ini hanya bisa digunakan di grup";

  let title = "Group";
  let member = 0;
  let duration = 0;
  let description = "";
  let profileBuffer;
  if (text && text.startsWith("https://chat.whatsapp.com/")) {
    try {
      const code = getInviteCode(text);
      const info = await conn.groupGetInviteInfo(code);
      title = info.subject || title;
      member = info.size || 0;
      duration = info.ephemeralDuration || 0;
      description = info.desc || "";
      const ppUrl = await getPPGrup(text);
      if (ppUrl) profileBuffer = await urlToBuffer(ppUrl);
    } catch (e) {
      console.error("Invite error:", e);
      throw "❌ Link grup tidak valid / expired";
    }
  } else {
    const meta = await conn.groupMetadata(m.chat);
    title = meta.subject || title;
    member = meta.participants?.length || 0;
    duration = meta.ephemeralDuration || 0;
    description = meta.desc || "";
    try {
      const pp = await conn.profilePictureUrl(m.chat, "image");
      profileBuffer = await urlToBuffer(pp);
    } catch {}
  }
  const form = new FormData();
  form.append("title", title);
  form.append("member", String(member));
  form.append("duration", String(duration));
  form.append("description", description);

  if (profileBuffer) {
    form.append("profile", profileBuffer, {
      filename: "pp.png",
      contentType: "image/png"
    });
  }

  try {
    const res = await axios.post(
      "https://nazir99iq-canvas.hf.space/api/ssgcip",
      form,
      {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        maxBodyLength: Infinity
      }
    );

    await conn.sendMessage(
      m.chat,
      {
        image: res.data,
        caption: `Here @${m.sender.split("@")[0]} !!`,
        mentions: [m.sender]
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply(`❌ Gagal membuat info grup.: ${e}`);
  }
};

handler.help = ["ssgc <link grup>", "ssgcip <link grup>"];
handler.tags = ["tools", "maker"];
handler.command = ["ssgc", "ssgcip"];
handler.group = true;
handler.limit = true;

module.exports = handler;