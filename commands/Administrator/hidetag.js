const { MessageType } = require("@adiwajshing/baileys")
const i18n = require("i18n")
module.exports = {
  name: ["hidetag", "pengumuman", "announce"],
  description: i18n.__('group.hidetag.description'),
  tags: "admin",
  group: true,
  admin: true,
  botAdmin: true,
  async run(m, { conn, text, participants }) {
    let users = participants.map(u => u.jid)
    let q = m.quoted ? m.quoted : m
    let c = m.quoted ? m.quoted : m.smessage
    let msg = conn.cMod(
      m.chat,
      conn.prepareMessageFromContent(
        m.chat,
        { [c.toJSON ? q.mtype : MessageType.extendedText]: c.toJSON ? c.toJSON() : {
          text: c || ''
        } },
        {
          contextInfo: {
            mentionedJid: users
          },
          quoted: m
        }
      ),
      text || q.text 
    )
    await conn.relayWAMessage(msg)
  }
}