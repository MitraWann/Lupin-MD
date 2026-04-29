/*
@ author: Herza
@ type : CommonJS
@ ========> Info <=========
@ github: https://github.com/herzonly
@ wa_channel: https://whatsapp.com/channel/0029VaGVOvq1iUxY6WgHLv2R
*/

const https = require('https');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://savenow.to/',
    }}, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch { resolve(Buffer.concat(chunks).toString()); }
      });
    }).on('error', reject);
  });
}

async function ytdl(link, quality) {
  const qualityMap = {
    'mp3':  { type: 'audio', format: 'mp3'  },
    '2160': { type: 'video', format: '4k'   },
    '1440': { type: 'video', format: '1440' },
    '1080': { type: 'video', format: '1080' },
    '720':  { type: 'video', format: '720'  },
    '480':  { type: 'video', format: '480'  },
    '360':  { type: 'video', format: '360'  },
    '240':  { type: 'video', format: '240'  },
    '144':  { type: 'video', format: '144'  },
  };

  const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:.*[?&]v=|shorts\/|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
  if (!match) return { success: false, data: 'Invalid YouTube URL' };
  const videoId = match[1];

  const resolved = qualityMap[quality];
  if (!resolved) return { success: false, data: 'Invalid quality' };

  try {
    const ytUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    const init = await httpGet(`https://p.savenow.to/ajax/download.php?copyright=0&format=${resolved.format}&url=${ytUrl}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`);
    if (!init.success) throw new Error('Failed to initiate download');

    let downloadUrl;
    while (true) {
      const prog = await httpGet(init.progress_url);
      if (prog.success === 1 && prog.download_url) { downloadUrl = prog.download_url; break; }
      await new Promise(r => setTimeout(r, 1500));
    }

    const ext = resolved.type === 'audio' ? 'mp3' : 'mp4';
    const title = init.info?.title || init.title || videoId;

    return {
      success: true,
      data: {
        metadata: {
          title,
          thumbnail: init.info?.image || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          videoId,
        },
        download: {
          quality,
          type: resolved.type,
          format: ext,
          url: downloadUrl,
          filename: `${title}.${ext}`,
        },
      },
    };
  } catch (e) {
    return { success: false, data: e.message };
  }
}

module.exports = { ytdl };

 /*This Code Uploaded By NotMeBotz - MD, DO NOT DELETE WM | | Friday, 20 March 2026 || 06:48:21 WIB */