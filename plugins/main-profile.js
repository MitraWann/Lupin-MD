let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../lib/levelling')
const { createHash } = require('crypto')
const { createCanvas, loadImage } = require('canvas') // Menambahkan library canvas

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : m.sender))

  if (!who.includes('@')) who += '@s.whatsapp.net'

  let users = global.db.data.users
  // Database fallback: Menghapus 'unlockedTitles' dan 'activeTitle'
  if (!users[who]) users[who] = { exp: 0, limit: 10, lastclaim: 0, registered: false, name: '', age: -1, regTime: -1, premium: false, premiumTime: 0, level: 0, money: 0, role: 'Newbie ㋡', banned: false }

  let user = users[who]
  
  // Destructuring bersih tanpa activeTitle
  let { name, limit, exp, money, lastclaim, premiumTime, premium, registered, age, level } = user
  let username = registered ? name : await conn.getName(who) || 'User';

  // Get Profile Picture dengan fallback UI Avatars jika tidak ada/diprivasi
  let ppUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXIdvC1Q4WL7_zA6cJm3yileyBT2OsWhBb9Q&usqp=CAU'
  try { 
      ppUrl = await conn.profilePictureUrl(who, 'image') 
  } catch (e) {
      ppUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=512`;
  }
  let about = ''; try { about = (await conn.fetchStatus(who)).status || '' } catch {}

  // 1. DYNAMIC RPG ROLE SYNC (Sesuai rpg-checkrole.js)
  let role = (level <= 2) ? 'Newbie ㋡'
    : (level <= 4) ? 'Beginner Grade 1 ⚊¹'
    : (level <= 6) ? 'Beginner Grade 2 ⚊²'
    : (level <= 8) ? 'Beginner Grade 3 ⚊³'
    : (level <= 10) ? 'Beginner Grade 4 ⚊⁴'
    : (level <= 20) ? 'Private Grade 1 ⚌¹'
    : (level <= 30) ? 'Private Grade 2 ⚌²'
    : (level <= 40) ? 'Private Grade 3 ⚌³'
    : (level <= 50) ? 'Private Grade 4 ⚌⁴'
    : (level <= 60) ? 'Private Grade 5 ⚌⁵'
    : (level <= 70) ? 'Corporal Grade 1 ☰¹' 
    : (level <= 80) ? 'Corporal Grade 2 ☰²' 
    : (level <= 90) ? 'Corporal Grade 3 ☰³' 
    : (level <= 100) ? 'Corporal Grade 4 ☰⁴' 
    : (level <= 110) ? 'Corporal Grade 5 ☰⁵'
    : (level <= 120) ? 'Sergeant Grade 1 ≣¹'
    : (level <= 130) ? 'Sergeant Grade 2 ≣²'
    : (level <= 140) ? 'Sergeant Grade 3 ≣³'
    : (level <= 150) ? 'Sergeant Grade 4 ≣⁴'
    : (level <= 160) ? 'Sergeant Grade 5 ≣⁵' 
    : (level <= 170) ? 'Staff Grade 1 ﹀¹' 
    : (level <= 180) ? 'Staff Grade 2 ﹀²' 
    : (level <= 190) ? 'Staff Grade 3 ﹀³' 
    : (level <= 200) ? 'Staff Grade 4 ﹀⁴' 
    : (level <= 210) ? 'Staff Grade 5 ﹀⁵' 
    : (level <= 220) ? 'Sergeant Grade 1 ︾¹'
    : (level <= 230) ? 'Sergeant Grade 2 ︾²'
    : (level <= 240) ? 'Sergeant Grade 3 ︾³'
    : (level <= 250) ? 'Sergeant Grade 4 ︾⁴'
    : (level <= 260) ? 'Sergeant Grade 5 ︾⁵'
    : (level <= 270) ? '2nd Lt. Grade 1 ♢¹'
    : (level <= 280) ? '2nd Lt. Grade 2 ♢²'  
    : (level <= 290) ? '2nd Lt. Grade 3 ♢³' 
    : (level <= 300) ? '2nd Lt. Grade 4 ♢⁴' 
    : (level <= 310) ? '2nd Lt. Grade 5 ♢⁵'
    : (level <= 320) ? '1st Lt. Grade 1 ♢♢¹'
    : (level <= 330) ? '1st Lt. Grade 2 ♢♢²'
    : (level <= 340) ? '1st Lt. Grade 3 ♢♢³'
    : (level <= 350) ? '1st Lt. Grade 4 ♢♢⁴'
    : (level <= 360) ? '1st Lt. Grade 5 ♢♢⁵'
    : (level <= 370) ? 'Major Grade 1 ✷¹'
    : (level <= 380) ? 'Major Grade 2 ✷²'
    : (level <= 390) ? 'Major Grade 3 ✷³'
    : (level <= 400) ? 'Major Grade 4 ✷⁴'
    : (level <= 410) ? 'Major Grade 5 ✷⁵'
    : (level <= 420) ? 'Colonel Grade 1 ✷✷¹'
    : (level <= 430) ? 'Colonel Grade 2 ✷✷²'
    : (level <= 440) ? 'Colonel Grade 3 ✷✷³'
    : (level <= 450) ? 'Colonel Grade 4 ✷✷⁴'
    : (level <= 460) ? 'Colonel Grade 5 ✷✷⁵'
    : (level <= 470) ? 'Brigadier Early ✰'
    : (level <= 480) ? 'Brigadier Silver ✩'
    : (level <= 490) ? 'Brigadier gold ✯' 
    : (level <= 500) ? 'Brigadier Platinum ✬'
    : (level <= 600) ? 'Brigadier Diamond ✪'
    : (level <= 700) ? 'Legendary 忍'
    : (level <= 800) ? 'Legendary 忍忍'
    : (level <= 900) ? 'Legendary 忍忍忍'
    : (level <= 1000) ? 'Legendary忍忍忍忍'
    : 'Infinity 숒';
  
  user.role = role

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
  let remainingXp = max - exp
  let sn = createHash('md5').update(who).digest('hex').substring(0, 12)

  // LOGIKA TAMPILAN UI
  let str = `
*╭───[ 👤 PROFILE USER ]───*
*│* 🆔 *Nama:* ${username}
*│* 🏷️ *Tag:* @${who.split('@')[0]}
*│* 📝 *Bio:* ${about || 'Tidak ada bio'}
*│* 🎂 *Umur:* ${registered ? age + ' thn' : '-'}
*╰──────────────────*

*╭───[ ⚔️ RPG STATS ]───*
*│* 📊 *Level:* ${level}
*│* 🔰 *Role:* ${role}
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
      console.error("Canvas Profile Error:", e);
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