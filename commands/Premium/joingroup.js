const i18n = require("i18n")

module.exports = {
    name: ['joingroup', 'joingc'],
    description: i18n.__('premium.joingroup.description'),
    tags: "premium",
    premium: true,
    async run(m, { conn, text }) {
        let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
        let [_, code] = text.match(linkRegex) || []
        if (!code) throw 'Your link is invalid'
        let result = await conn.acceptInvite(code)
        conn.reply(m.chat, `Successfully joined the group: ${result.gid}`, m)
    }
}