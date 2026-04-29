const geminiScraper = require('./gemini')

async function chat({ message, instruction = '', imageBuffer = null, history = [] }) {
    if (imageBuffer) {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai')
            const config = require('../../config')
            const apiKey = config.geminiApiKey
            if (!apiKey) throw new Error('No API key')

            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

            const contents = []

            if (history.length > 0) {
                for (const h of history.slice(-10)) {
                    contents.push({
                        role: h.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: h.content }]
                    })
                }
            }

            contents.push({
                role: 'user',
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBuffer.toString('base64') } },
                    { text: message }
                ]
            })

            const result = await model.generateContent({
                contents,
                systemInstruction: instruction || undefined,
                generationConfig: { maxOutputTokens: 1024, temperature: 0.8 }
            })

            const text = result.response.text()
            return { text: text.replace(/\*\*(.+?)\*\*/g, '*$1*'), raw: text, model: 'gemini-2.0-flash' }
        } catch (e) {
            console.log('[GeminiVision] Vision API failed, responding about image without analysis:', e.message)
            const result = await geminiScraper({
                message: '[User mengirim gambar] ' + message,
                instruction
            })
            return { text: result.text, raw: result.text, model: 'scraper-fallback' }
        }
    }

    const result = await geminiScraper({ message, instruction })
    return { text: result.text, raw: result.text, model: 'scraper' }
}

module.exports = { chat }
