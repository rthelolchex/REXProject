const { Instagram } = require('../../lib/scrape')
const { MessageType } = require('@adiwajshing/baileys')
const fetch = require('node-fetch')
const i18n = require('i18n')
module.exports = {
    name: ["ig", "igdl"], 
    tags: "downloader",
    description: i18n.__('downloader.ig.description'),
    group: false,
    admin: false, 
    botAdmin: false, 
    owner: false, 
    async run(m, { conn, args, text }) {
        if (!text) throw i18n.__('failed.urlNotIncluded')
        let data = await Instagram.downloader(text)
        conn.reply(m.chat, i18n.__('process'), m)
        let vbuff = await fetch(data.video_link, {headers: { 'User-Agent': 'okhttp/4.5.0'}, method: 'GET' })
        let buff = await vbuff.buffer()
        let str = `
****************************
--- Instagram Downloader ---
****************************
Title : ${data.title}
URL : ${data.url}
Description : ${data.description}
Total like : ${data.total_like}
Total comments : ${data.total_comment}
Total viewers : ${data.view_count}
Total diputar : ${data.play_count}
****************************
${global.footerText}
        `.trim()
        conn.sendMessage(m.chat, buff, MessageType.video, { quoted: m, caption: str })
    }
}