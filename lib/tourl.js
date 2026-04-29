const axios = require('axios')
const FormData = require('form-data')

async function uploadToTelegraph(buffer, filename = 'media.jpg') {
    const form = new FormData()
    form.append('file', buffer, { filename })
    
    const response = await axios.post('https://telegra.ph/upload', form, {
        headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
    })
    
    if (response.data?.[0]?.src) {
        return 'https://telegra.ph' + response.data[0].src
    }
    
    throw new Error('Telegraph upload failed')
}

async function uploadTo0x0(buffer, filename = 'media.jpg') {
    const form = new FormData()
    form.append('file', buffer, { filename })
    
    const response = await axios.post('https://0x0.st', form, {
        headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
    })
    
    if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
        return response.data.trim()
    }
    
    throw new Error('0x0.st upload failed')
}

async function uploadToTmpfiles(buffer, filename = 'media.jpg') {
    const form = new FormData()
    form.append('file', buffer, { filename })
    
    const response = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
        timeout: 30000
    })
    
    if (response.data?.status === 'success' && response.data?.data?.url) {
        return response.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
    }
    
    throw new Error('Tmpfiles upload failed')
}

async function uploadToCatbox(buffer, filename = 'media.jpg') {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename })
    
    const response = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: { ...form.getHeaders(), 'User-Agent': 'Mozilla/5.0' },
        timeout: 60000
    })
    
    if (response.data && typeof response.data === 'string' && response.data.startsWith('http')) {
        return response.data
    }
    
    throw new Error('Catbox upload failed')
}

// Tambahan: Scraper Uguu (Dimodifikasi menggunakan Buffer)
async function uploadToUguu(buffer, filename = 'media.jpg') {
    const form = new FormData()
    form.append("files[]", buffer, { filename })
    
    const response = await axios.post("https://uguu.se/upload.php", form, {
        headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            ...form.getHeaders() 
        },
        timeout: 30000
    })
    
    if (response.data && response.data.success && response.data.files && response.data.files[0].url) {
        return response.data.files[0].url
    }
    
    throw new Error('Uguu upload failed')
}

async function uploadImage(buffer, filename = 'media.jpg') {
    // Uguu dimasukkan ke urutan atas karena limitnya cukup besar (100MB) dan cepat
    const uploaders = [
        { name: 'Uguu', fn: uploadToUguu },
        { name: 'Catbox', fn: uploadToCatbox },
        { name: 'Telegraph', fn: uploadToTelegraph },
        { name: 'Tmpfiles', fn: uploadToTmpfiles },
        { name: '0x0.st', fn: uploadTo0x0 }
    ]
    
    for (const uploader of uploaders) {
        try {
            const url = await uploader.fn(buffer, filename)
            console.log(`Upload success via ${uploader.name}: ${url}`)
            return url
        } catch (err) {
            console.log(`${uploader.name} failed: ${err.message}`)
        }
    }
    
    throw new Error('All uploaders failed')
}

module.exports = { uploadImage, uploadToTelegraph, uploadTo0x0, uploadToTmpfiles, uploadToCatbox, uploadToUguu }