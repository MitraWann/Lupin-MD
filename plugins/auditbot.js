const fs = require("fs")
const path = require("path")

const suspiciousPatterns = [
  { name: "eval()", regex: /\beval\s*\(/g },
  { name: "Function constructor", regex: /new Function\s*\(/g },
  { name: "child_process exec", regex: /\bexec\s*\(/g },
  { name: "child_process spawn", regex: /\bspawn\s*\(/g },
  { name: "child_process fork", regex: /\bfork\s*\(/g },
  { name: "Base64 decode", regex: /Buffer\.from\(.+?,\s*['"]base64['"]\)/g },
  { name: "Obfuscation", regex: /_0x[a-f0-9]+/gi },
  { name: "HTTP suspicious", regex: /https?:\/\/[^\s'"]+/g }
]

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8")
  let findings = []

  for (let pattern of suspiciousPatterns) {
    const matches = content.match(pattern.regex)
    if (matches) {
      findings.push({
        type: pattern.name,
        count: matches.length
      })
    }
  }

  return findings
}

function scanDirectory(dir) {
  let results = []

  const files = fs.readdirSync(dir)
  for (let file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      results.push(...scanDirectory(fullPath))
    } else if (file.endsWith(".js")) {
      const findings = scanFile(fullPath)
      if (findings.length > 0) {
        results.push({
          file: fullPath,
          findings
        })
      }
    }
  }

  return results
}

let handler = async (m, { conn }) => {
  try {
    const baseDir = process.cwd()
    const results = scanDirectory(baseDir)

    if (results.length === 0) {
      return conn.reply(m.chat, "✅ Tidak ditemukan indikasi backdoor.", m)
    }

    let report = "⚠️ *HASIL AUDIT BACKDOOR*\n\n"

    for (let res of results) {
      report += `📂 ${res.file}\n`
      for (let f of res.findings) {
        report += `  - ${f.type}: ${f.count}x\n`
      }
      report += "\n"
    }

    conn.reply(m.chat, report, m)

  } catch (err) {
    conn.reply(m.chat, "❌ Error saat audit:\n" + err.message, m)
  }
}

handler.help = ["auditbot"]
handler.tags = ["owner"]
handler.command = /^auditbot$/i
handler.owner = true

module.exports = handler