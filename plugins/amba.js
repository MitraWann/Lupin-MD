/**
  *» Nama :* — [ IMAGE TO IMAGE - AI ] —
  *» Type :* Plugin - CommonJS (Fixed)
  *» Base Url :* https://www.createimg.com
  *» Saluran :* https://whatsapp.com/channel/0029Vb7XfVV2v1IzPVqjgq37
  *» Creator :* -Ɗαnčoᴡ々
**/

const fetch = require('node-fetch');
const FormData = require('form-data');

const API_BASE = 'https://www.createimg.com?api=v1';
const imageStaging = {};

class CreateImgAPI {
  constructor() {
    this.token = null;
    this.security = null;
    this.server = null;
  }

  generateSecurity() {
    return Array.from({length: 32}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async initialize(module = 'edit') {
    const cfToken = await bypassTurnstile();
    this.security = this.generateSecurity();
    
    const params = new URLSearchParams({
      token: cfToken,
      security: this.security,
      action: 'turnstile',
      module: module
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    const data = await res.json();
    if (!data.status) throw new Error('Inisialisasi gagal');

    this.token = cfToken;
    this.server = data.server;
    return data;
  }

  async uploadImages(imageBuffer, refBuffer = null) {
    if (!this.token) await this.initialize('edit');

    const form = new FormData();
    form.append('token', this.token);
    form.append('security', this.security);
    form.append('action', 'upload');
    form.append('server', this.server);
    form.append('image', imageBuffer, 'image.jpg');
    
    if (refBuffer) {
      form.append('ref', refBuffer, 'ref.jpg');
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/',
        ...form.getHeaders()
      },
      body: form
    });

    return await res.json();
  }

  async edit(prompt, imageFile, refFile = null, options = {}) {
    if (!this.token) await this.initialize('edit');

    const params = new URLSearchParams({
      token: this.token,
      security: this.security,
      action: 'edit',
      server: this.server,
      prompt: prompt,
      negative: options.negative || '',
      seed: options.seed || Math.floor(Math.random() * 1000000000),
      size: options.size || 560,
      'files[image]': imageFile
    });

    if (refFile) {
      params.append('files[ref]', refFile);
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async checkQueue(id, queue) {
    const params = new URLSearchParams({
      id,
      queue,
      module: 'edit',
      action: 'queue',
      server: this.server,
      token: this.token,
      security: this.security
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async getHistory(id) {
    const params = new URLSearchParams({
      id,
      action: 'history',
      server: this.server,
      module: 'edit',
      token: this.token,
      security: this.security
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async getOutput(filename) {
    const params = new URLSearchParams({
      id: filename,
      action: 'output',
      server: this.server,
      module: 'edit',
      token: this.token,
      security: this.security,
      page: 'home',
      lang: 'en'
    });

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Origin': 'https://www.createimg.com',
        'Referer': 'https://www.createimg.com/'
      },
      body: params
    });

    return await res.json();
  }

  async generate(prompt, imageBuffer, refBuffer = null, options = {}) {
    const uploadRes = await this.uploadImages(imageBuffer, refBuffer);
    if (!uploadRes.status) throw new Error(`Upload failed: ${JSON.stringify(uploadRes)}`);

    const imageFile = uploadRes.filename.image;
    const refFile = refBuffer ? uploadRes.filename.ref : null;

    const editRes = await this.edit(prompt, imageFile, refFile, options);
    if (!editRes.status) throw new Error(`Edit failed: ${JSON.stringify(editRes)}`);

    const { id, queue } = editRes;
    
    let pending = 1;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (pending > 0 && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 3000));
      attempts++;
      const queueRes = await this.checkQueue(id, queue);
      pending = queueRes.pending || 0;
    }

    if (attempts >= maxAttempts) throw new Error('Timeout');

    const historyRes = await this.getHistory(id);
    if (!historyRes.status) throw new Error(`History failed: ${JSON.stringify(historyRes)}`);

    const outputRes = await this.getOutput(historyRes.file);
    if (!outputRes.status) throw new Error(`Output failed: ${JSON.stringify(outputRes)}`);

    return {
      id,
      filename: historyRes.file,
      data: outputRes.data
    };
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  const userId = m.sender;

  if (!mime && !text) {
    return m.reply(`*📖 Panduan Penggunaan:*

*1️⃣ Edit Satu Gambar:*
Kirim/balas gambar + caption *${usedPrefix + command}* <deskripsi>
Contoh: *${usedPrefix + command}* ubah jadi kartun

*2️⃣ Edit Dua Gambar (Gabungan):*
• Kirim gambar 1 + *${usedPrefix + command}*
• Kirim gambar 2 + *${usedPrefix + command}* <deskripsi>
Contoh: *${usedPrefix + command}* gabungkan gaya keduanya

*⚠️ Catatan:* Maksimal 2 gambar`);
  }

  if (mime && !/image|webp/.test(mime)) {
    return m.reply(`Silakan kirim/balas gambar dengan caption *${usedPrefix + command}* <deskripsi>`);
  }

  if (!text || text.trim() === '') {
    try {
      const media = await q.download();
      
      if (!imageStaging[userId]) imageStaging[userId] = [];
      if (imageStaging[userId].length >= 1) {
        return m.reply(`⚠️ *Batas tercapai!*\n\nKirim gambar kedua + *${usedPrefix + command}* <deskripsi> untuk memproses.`);
      }
      
      imageStaging[userId].push(media);
      
      return m.reply(`✅ *Gambar 1 tersimpan*\n\nKirim gambar kedua + *${usedPrefix + command}* <deskripsi> untuk melanjutkan.`);
    } catch (e) {
      return m.reply(`Terjadi kesalahan: ${e.message}`);
    }
  }

  await m.reply('🎨 Memproses gambar, mohon tunggu...');

  try {
    const api = new CreateImgAPI();
    
    let mainImage, refImage = null;
    
    if (imageStaging[userId] && imageStaging[userId].length > 0) {
      refImage = imageStaging[userId][0];
      mainImage = await q.download();
      delete imageStaging[userId];
    } else {
      mainImage = await q.download();
    }

    const result = await api.generate(text, mainImage, refImage);

    await conn.sendMessage(m.chat, {
      image: { url: result.data },
      caption: `✨ *Proses Selesai*\n\n💬 Prompt: ${text}`
    }, { quoted: m });

  } catch (e) {
    throw `Error: ${e.message}`;
  }
};

handler.help = ['editimg'];
handler.tags = ['ai'];
handler.command = /^(editimg)$/i;

module.exports = handler;

async function bypassTurnstile() {
  const url = 'https://api.nekolabs.web.id/tools/bypass/cf-turnstile?url=https://www.createimg.com/&siteKey=0x4AAAAAABggkaHPwa2n_WBx';
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error('Bypass gagal');
  return data.result;
}