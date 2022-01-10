const users = require('../../users.json')
const i18n = require('i18n')
const fs = require('fs')
module.exports = {
    name: ['addprem', 'addpremium'],
    description: i18n.__('owner.addprem.description'),
    tags: "owner",
    rowner: true,
    async run(m, { conn }) {
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
        else who = m.chat
        if (!who) throw i18n.__('failed.notMentioned')
        if (users.premium.includes(who.split`@`[0])) throw i18n.__mf('failed.alreadyPremium', { user: who.split`@`[0] })
        users.premium.push(who.split`@`[0])
        fs.writeFileSync('./users.json', JSON.stringify(users, null, '\t'))
        conn.reply(m.chat, i18n.__mf('event.hasPremium', { user: who.split`@`[0] }), m, m.mentionedJid ? {
            contextInfo: {
              mentionedJid: m.mentionedJid
            }
          } : {})
    }
}