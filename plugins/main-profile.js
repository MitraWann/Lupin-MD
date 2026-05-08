let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const { createCanvas, loadImage } = require('canvas') // Menambahkan library canvas

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.sender))
  
  // 1. Resolve PN (Phone Number) untuk Database (Mencegah reset data limit/uang)
  let pn = who;
  if (typeof conn.getJid === 'function') {
      pn = await conn.getJid(who) || who;
  }
  who = pn; // Tetap gunakan who sebagai standar PN agar kompatibel di sisa kode
  if (!who.includes('@')) who += '@s.whatsapp.net'

  // 2. Resolve LID (Linked Device) untuk System & UI
  let lid = 'Tidak diketahui';
  if (who.endsWith('@lid')) {
      lid = who;
  } else {
      // Cari LID dari partisipan grup
      if (m.isGroup) {
          try {
              let groupMetadata = await conn.groupMetadata(m.chat);
              let participant = groupMetadata.participants.find(p => p.id === who);
              if (participant && participant.lid) {
                  lid = participant.lid;
              }
          } catch (e) {
          }
      }
      // Fallback cari LID di Cache jika tidak ketemu di metadata grup
      if (lid === 'Tidak diketahui' && conn.isLid) {
          let keys = conn.isLid.keys();
          for (let key of keys) {
              if (conn.isLid.get(key) === who) {
                  lid = key;
                  break;
              }
          }
      }
  }

  let users = global.db.data.users
  
  if (!users[who]) {
      users[who] = { exp: 0, limit: 10, lastclaim: 0, registered: false, name: '', age: -1, regTime: -1, premium: false, premiumTime: 0, level: 0, money: 0, role: 'Newbie ㋡', banned: false }
  }

  let user = users[who]
  
  // Destructuring bersih
  let { name, limit, exp, money, lastclaim, premiumTime, premium, registered, age, level } = user
  let username = registered ? name : await conn.getName(who) || 'User';

  // Get Profile Picture dengan fallback UI Avatars jika tidak ada/diprivasi
  let ppUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU'
  try { 
      // Coba fetch PP via LID terlebih dahulu (Bypass privasi PP WA terbaru)
      ppUrl = await conn.profilePictureUrl(lid !== 'Tidak diketahui' ? lid : who, 'image') 
  } catch (e) {
      try {
          // Fallback fetch via PN normal
          ppUrl = await conn.profilePictureUrl(who, 'image') 
      } catch (e) {
          // Jika masih disembunyikan/tidak ada PP, gunakan nama fallback avatar
          ppUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=512`;
      }
  }
  let about = ''; try { about = (await conn.fetchStatus(who)).status || '' } catch {}

  // 2. TULIPNEX TRADER CALCULATION & BOARD
  let p = global.db.data.settings?.trading?.prices || {}
  let assetValue = (user.ivylink||0)*(p.IVL||3000) + (user.lilybit||0)*(p.LBT||100000) + (user.iriscode||0)*(p.IRC||1000000) + (user.lotusnet||0)*(p.LTN||10000000) + (user.rosex||0)*(p.RSX||100000000) + (user.tulipnex||0)*(p.TNX||1000000000)
  let networth = money + assetValue;

  let tnxHolders = Object.entries(users).filter(u => (u[1].tulipnex || 0) > 0).sort((a, b) => (b[1].tulipnex || 0) - (a[1].tulipnex || 0));
  let tnxRank = tnxHolders.findIndex(u => u[0] === who);
  let tulipRole = '';

  if (tnxRank === 0) tulipRole = 'CEO TulipNex';
  else if (tnxRank === 1) tulipRole = 'Komisaris Utama';
  else if (tnxRank === 2) tulipRole = 'Direktur Eksekutif';
  else {
      if (networth >= 1000000000000) tulipRole = '🐋 Whale'; 
      else if (networth >= 100000000000) tulipRole = '🦈 Shark'; 
      else if (networth >= 10000000000) tulipRole = '🐬 Dolphin'; 
      else if (networth >= 1000000000) tulipRole = '🐢 Turtle'; 
      else if (networth >= 100000000) tulipRole = '🦀 Crab'; 
      else tulipRole = '🐟 Shrimp'; 
  }

  let bankDebt = user.bankLoan ? simplifyMoney(user.bankLoan.debt) : 'Nihil'

  // 3. XP LOGIC
  let { min, xp, max } = levelling.xpRange(level, global.multiplier)
  let currentXpInLevel = exp - min
  let sn = createHash('md5').update(who).digest('hex').substring(0, 12)

  // LOGIKA TAMPILAN UI
  let str = `
*╭───[ 👤 PROFILE USER ]───*
*│* 🆔 *Nama:* ${username}
*│* 🏷️ *Tag:* @${who.split('@')[0]}
*│* 🎂 *Umur:* ${registered ? age + ' thn' : '-'}
*╰──────────────────*

*╭───[ ⚔️ RPG STATS ]───*
*│* 📊 *Level:* ${level}
*│* ✨ *Exp:* ${currentXpInLevel.toLocaleString('id-ID')} / ${xp.toLocaleString('id-ID')}
*│* 💎 *Limit:* ${limit.toLocaleString('id-ID')}
*╰──────────────────*

*╭───[ 📈 TRADER (CBE) ]───*
*│* 💵 *Tunai:* Rp ${simplifyMoney(money)}
*│* 💼 *Aset:* Rp ${simplifyMoney(assetValue)}
*│* 🏛️ *Networth:* Rp ${simplifyMoney(networth)}
*│* 🌟 *TulipNex:* ${tulipRole}
*│* 🏦 *Utang Bank:* ${bankDebt}
*╰──────────────────*

*╭───[ ⚙️ SYSTEM INFO ]───*
*│* 📌 *Daftar:* ${registered ? '✅' : '❌'}
*│* ⭐ *Premium:* ${premium ? '✅' : '❌'}
*│* ⏳ *Expired:* ${premium && premiumTime > 0 ? msToDate(premiumTime - Date.now()) : (premium ? 'Permanent' : '-')}
*│* 🔑 *S/N:* ${sn}...
*╰──────────────────*
`.trim()

  // 4. PEMBUATAN CANVAS MYUI (MENGGANTIKAN FOTO PROFIL BIASA)
  let finalImage;
  try {
      const width = 1080;
      const height = 640; 
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      let bannerUrl = user?.profilebg || 'https://picsum.photos/1080/480'; 
      let bannerImg, avatarImg;
      
      try {
          bannerImg = await loadImage(bannerUrl);
      } catch (err) {
          bannerImg = await loadImage('https://picsum.photos/1080/480');
      }
      
      avatarImg = await loadImage(ppUrl);

      // Render Banner Atas
      ctx.drawImage(bannerImg, 0, 0, width, 480);

      // Render Foto Profil (Menimpa banner)
      const avatarSize = 300;
      const avatarX = width / 2;
      const avatarY = 480;

      // Membuat "border transparan"
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, (avatarSize / 2) + 10, 0, Math.PI * 2, true);
      ctx.fill(); 
      ctx.restore();

      // Masking foto profil
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX - (avatarSize / 2), avatarY - (avatarSize / 2), avatarSize, avatarSize);
      ctx.restore();

      finalImage = canvas.toBuffer('image/png');
  } catch (e) {
      // Fallback: Jika render canvas gagal, kirim foto profil secara langsung (default WhatsApp)
      finalImage = { url: ppUrl };
  }

  await conn.sendMessage(m.chat, { image: finalImage, caption: str, mentions: [who] }, { quoted: m })
}

handler.help = ['profile', 'profil [@user]']
handler.tags = ['main']
handler.command = /^(profile?|profil)$/i

module.exports = handler

function simplifyMoney(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'Jt'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'Rb'
  return num.toString()
}

function msToDate(ms) {
  if (!ms || ms < 0) return '-'
  let d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return `${d}hr ${h}j ${m}m`
}