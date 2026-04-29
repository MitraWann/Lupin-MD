const tiktok = require('./tiktok')
const instagram = require('./instagram')
const youtube = require('./youtube')
const twitter = require('./twitter')
const facebook = require('./facebook')
const threads = require('./threads')

function detect(url) {
    if (/tiktok/.test(url)) return 'tiktok'
    if (/instagram/.test(url)) return 'instagram'
    if (/youtu|youtube/.test(url)) return 'youtube'
    if (/twitter|x\.com/.test(url)) return 'twitter'
    if (/facebook|fb/.test(url)) return 'facebook'
    if (/threads/.test(url)) return 'threads'
    return null
}

async function downloader(url) {
    const type = detect(url)

    if (!type) throw new Error("Platform tidak didukung")

    switch (type) {
        case 'tiktok': return await tiktok(url)
        case 'instagram': return await instagram(url)
        case 'youtube': return await youtube(url)
        case 'twitter': return await twitter(url)
        case 'facebook': return await facebook(url)
        case 'threads': return await threads(url)
    }
}

module.exports = downloader