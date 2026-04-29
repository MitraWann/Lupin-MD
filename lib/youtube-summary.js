/*
YouTube Summary
Author: nath
Base: https:[sles]notegpt[dot]io/youtube-video-summarizer
Note: Adapted for CommonJS and WhatsApp Bot integration
*/

const fetch = require('node-fetch');

const COOKIES = 'sbox-guid=MTc3Mzc5NzUzMXw3NjV8OTIxODUyMzg0; anonymous_user_id=aee32c94-c981-4ee2-95e9-40e606d4a68c; _ga=GA1.2.1580741056.1773797526';

function extractVideoId(input) {
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    return url.searchParams.get('v') || input;
  } catch {
    return input;
  }
}

async function youtubeSummary(videoUrl, lang = 'id-ID') {
  const videoId = extractVideoId(videoUrl);

  // 1. Ambil Transcript
  const transcriptRes = await fetch(`https://notegpt.io/api/v2/video-transcript?platform=youtube&video_id=${videoId}`, {
    headers: {
      'Accept': 'application/json',
      'Referer': 'https://notegpt.io/youtube-video-summarizer',
      'Origin': 'https://notegpt.io',
      'Cookie': COOKIES
    }
  });
  
  const transcriptData = await transcriptRes.json();
  if (transcriptData.code !== 100000) throw new Error(transcriptData.message || 'Gagal mengambil transcript. Pastikan video memiliki subtitle/CC.');

  const videoInfo = transcriptData.data.videoInfo;
  const transcripts = transcriptData.data.transcripts;
  const langKey = Object.keys(transcripts)[0];
  
  if (!langKey) throw new Error('Transcript (Subtitle) tidak tersedia untuk video ini.');
  
  const transcriptList = transcripts[langKey].custom || transcripts[langKey].default;
  const transcriptText = transcriptList.map(t => `[${t.start} ~ ${t.end}] ${t.text}`).join('\n\n');

  // 2. Dapatkan Konfigurasi AI NoteGPT
  const configRes = await fetch('https://notegpt.io/api/v1/ai-tab/get-prod-config', {
    headers: { 'Accept': 'application/json', 'Cookie': COOKIES }
  });
  const configData = await configRes.json();
  if (configData.code !== 100000) throw new Error('Gagal mendapatkan konfigurasi AI NoteGPT');
  
  const { t, nonce, sign, secret_key, uid, app_id } = configData.data;

  await fetch(`https://notegpt.io/api/v1/model-config?business=summary&sign=${encodeURIComponent(sign)}&timestamp=${t}`, {
    headers: { 'Accept': 'application/json', 'Cookie': COOKIES }
  });

  // 3. Proses Rangkuman dengan AI
  const apiUrl = 'https://api.journeydraw.ai/chatgpt/v4/question';
  const prompt = `You are an **expert in summarizing video content**, skilled at extracting key information and generating **high-quality, well-structured summaries**.
Based on the provided Video Transcript, complete the following tasks:

**Task Description:**
Generate a professional, credible summary of the following content. The output must be strictly grounded in the source—no fabrication. Formatting: - Flexible structure: - Timeline table if chronological events exist. - Markdown tables for quantitative data, comparisons, or definitions. - Bulleted lists for clarity. - Only include content supported by the source; omit unsupported parts. - Bold key insights, terms, and conclusions. - Mark uncertain info as *Not specified/Uncertain*.- Bulleted lists should be plain, **without timestamps**.
Length: - Ensure the response has a minimum of 400 words
Depth: - The response should be brief in detail.

Language: - The entire output, including **section titles and labels**, must be written in the "${lang}" language (For example, ###Summary, ###Highlights, ###Key Insights, ###Outline, ###Core Concepts, ###Keywords, ###FAQ, etc. all need to be translated into ${lang} language.).
- Do **not** include any separators (\`---\`), or additional text outside of the task results.

The Video Transcript(the Text Content):
${transcriptText}`;

  const params = new URLSearchParams({ t, nonce, sign, secret_key, app_id, uid });
  const aiRes = await fetch(`${apiUrl}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: prompt })
  });

  const result = await aiRes.json();
  
  // Ambil teks balasan (mencegah error jika AI mereturn object)
  let finalSummary = typeof result === 'string' ? result : (result.data || JSON.stringify(result));

  return {
    success: true,
    title: videoInfo?.name || videoId,
    summary: finalSummary,
  };
}

module.exports = youtubeSummary;