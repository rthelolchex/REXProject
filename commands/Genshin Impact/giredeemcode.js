const gi = require("@rthelolchex/genshininfo_scraper")
const i18n = require("i18n")
const util = require("util")
module.exports = {
  name: "giredeemcode",
  description: i18n.__('gi.redeemcode.description'),
  tags: "gi",
  async run(m, { conn, text }) {
    let user = global.db.users[m.sender]
    if (!user.GICookie) throw i18n.__("gi.cookieNotFound")
    if (!text) throw i18n.__("failed.textNotIncluded")
    const data = await gi.ClaimReedemCode(user.GICookie, user.GIUID, text)
    if (data) {
      if (data.msg) conn.reply(m.chat, data.msg, m)
      else return conn.reply(m.chat, data.message, m)
    }
  }
}