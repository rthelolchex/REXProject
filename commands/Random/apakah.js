const i18n = require('i18n')
module.exports = {
  name: "apakah",
  description: i18n.__('random.kerangajaib.description'),
  tags: "random",
  async run(m, { conn, text }) {
    let ans = ["Ya", "Tidak", "Mungkin", "Mungkin iya", "Mungkin tidak", "YNTKTS", "Tidak mungkin", "Ga ngerti bang, coba lagi wkwk"]
    return conn.reply(m.chat, `*Pertanyaan*: ${m.text.slice(global.prefix.length)}\n*Jawaban:* ${pickRandom(ans)}`, m, m.mentionedJid ? {
      contextInfo: {
        mentionedJid: m.mentionedJid
      }
    } : {})
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}