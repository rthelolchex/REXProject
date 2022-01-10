const i18n = require('i18n')
module.exports = {
  name: ["owner", "creator"],
  description: i18n.__('info.owner.description'),
  tags: "info",
  async run(m, { conn }) {
    for (let owner of global.owner) {
      conn.sendContact(m.chat, owner, await conn.getName(owner + "@s.whatsapp.net"), m)
    }
  }
}