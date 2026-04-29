const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(__dirname, '../tmp', + new Date + '.' + ext)
      let out = tmp + '.' + ext2
      
      // Simpan buffer input ke file temporary
      await fs.promises.writeFile(tmp, buffer)
      
      spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ])
        .on('error', reject)
        .on('close', async (code) => {
          try {
            // 1. Hapus file input (temporary) setelah proses FFmpeg selesai
            if (fs.existsSync(tmp)) await fs.promises.unlink(tmp)
            
            if (code !== 0) return reject(code)
            
            // 2. Baca file output menjadi buffer
            let audioBuffer = await fs.promises.readFile(out)
            
            // 3. CRITICAL FIX: Hapus file output setelah dibaca agar tidak terjadi Storage Leak!
            if (fs.existsSync(out)) await fs.promises.unlink(out)
            
            resolve({ data: audioBuffer, filename: out })
          } catch (e) {
            reject(e)
          }
        })
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Convert Audio to Playable WhatsApp Voice Note (PTT)
 * Standar WA Klien: Codec Opus, Format OGG, 48kHz, Mono (1 Channel)
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', // Hapus stream video (jika inputnya video)
    '-c:a', 'libopus', // Codec Opus
    '-b:a', '128k', // Bitrate
    '-vbr', 'on', // Variable bitrate
    '-ar', '48000', // WAJIB: Sample rate 48kHz
    '-ac', '1'      // WAJIB: 1 Channel (Mono)
  ], ext, 'ogg')
}

/**
 * Convert Video/Audio to Standard MP3 (Music Player)
 * Standar format musik universal
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', // Hapus stream video
    '-c:a', 'libmp3lame', // Codec MP3
    '-b:a', '128k',
    '-q:a', '2' // Kualitas VBR yang bagus
  ], ext, 'mp3')
}

/**
 * Convert Video to Playable WhatsApp Video
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4')
}

module.exports = {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
}