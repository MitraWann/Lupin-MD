
const crypto = require('crypto')
const fs = require('fs')
const CryptoJS = require('crypto-js')
const path = require('path')

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`

const APP_ID = "aifaceswap"
const U_ID = "1H5tRtzsBkqXcaJ"

function generateRandomString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let res = ""
  for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length))
  return res
}

function aesenc(data, key) {
  const k = CryptoJS.enc.Utf8.parse(key)
  const encrypted = CryptoJS.AES.encrypt(data, k, {
    iv: k,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.toString()
}

function rsaenc(data) {
  const buffer = Buffer.from(data, 'utf8')
  const encrypted = crypto.publicEncrypt(
    {
      key: PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  )
  return encrypted.toString('base64')
}

function gencryptoheaders(type, fp = null) {
  const e = new Date()
  const n = Math.floor(new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds()).getTime() / 1000)
  const r = crypto.randomUUID()
  const i = generateRandomString(16)
  const fingerPrint = fp || crypto.randomBytes(16).toString('hex')
  const s = rsaenc(i)
  
  let signStr = (type === 'upload') ? `${APP_ID}:${r}:${s}` : `${APP_ID}:${U_ID}:${n}:${r}:${s}`

  return {
    'fp': fingerPrint,
    'fp1': aesenc(`${APP_ID}:${fingerPrint}`, i),
    'x-guide': s,
    'x-sign': aesenc(signStr, i),
    'x-code': Date.now().toString()
  }
}

async function upimage(img) {
  const cryptoHeaders = gencryptoheaders('upload')
  const blob = new Blob([img], { type: 'image/jpeg' })
  const form = new FormData()

  form.append('file', blob, `image-${Date.now()}.jpg`)
  form.append('fn_name', 'demo-image-editor')
  form.append('request_from', '9')
  form.append('origin_from', '8f3f0c7387123ae0')

  const res = await fetch('https://app.live3d.io/aitools/upload-img', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
      'Accept': 'application/json, text/plain, */*',
      'origin': 'https://live3d.io',
      'referer': 'https://live3d.io/',
      'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
      ...cryptoHeaders
    },
    body: form
  })
  
  const data = await res.json()
  return { path: data.data.path, fp: cryptoHeaders.fp }
}

async function createJob(imgRemote, prompt, fp) {
  const cryptoHeaders = gencryptoheaders('create', fp)
  const payload = {
    fn_name: 'demo-image-editor',
    call_type: 3,
    input: {
      model: 'nano_banana_pro',
      source_images: [imgRemote],
      prompt: prompt,
      aspect_radio: 'auto',
      request_from: 9
    },
    request_from: 9,
    origin_from: '8f3f0c7387123ae0'
  }

  const res = await fetch('https://app.live3d.io/aitools/of/create', {
    method: 'POST',
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
      'Content-Type': 'application/json',
      'origin': 'https://live3d.io',
      'referer': 'https://live3d.io/',
      'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
      ...cryptoHeaders 
    },
    body: JSON.stringify(payload)
  })
  
  const data = await res.json()
  return data.data.task_id
}

async function cekjob(taskId, fp) {
  const cryptoHeaders = gencryptoheaders('check', fp)
  const payload = {
    task_id: taskId,
    fn_name: 'demo-image-editor',
    call_type: 3,
    request_from: 9,
    origin_from: '8f3f0c7387123ae0'
  }

  const res = await fetch('https://app.live3d.io/aitools/of/check-status', {
    method: 'POST',
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
      'Content-Type': 'application/json',
      'origin': 'https://live3d.io',
      'referer': 'https://live3d.io/',
      'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
      ...cryptoHeaders 
    },
    body: JSON.stringify(payload)
  })
  
  const data = await res.json()
  return data.data
}

async function live3d(img, prompt) {
  const uploadInfo = await upimage(img)
  const taskId = await createJob(uploadInfo.path, prompt, uploadInfo.fp)

  let result
  do {
    await new Promise(r => setTimeout(r, 4000))
    result = await cekjob(taskId, uploadInfo.fp)
  } while (result.status !== 2)

  return {
    task_id: taskId,
    image: 'https://temp.live3d.io/' + result.result_image
  }
}

module.exports = { live3d }