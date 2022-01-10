const i18n = require('i18n')
module.exports = {
  name: "deviceinfo",
  description: i18n.__('info.deviceinfo.description'),
  tags: "info",
  async run(m, { conn }) {
    let phone = conn.user.phone
    let WAVersion = phone.wa_version
    let OSVersion = phone.os_version
    let model = `${phone.device_manufacturer} ${phone.device_model}`
    let battery = conn.battery ? `${conn.battery.value}%, Charging : ${conn.battery.live === true ? "Yes" : "No"}` : "Unknown"
    let str = `>> *Device Info* <<\n• Phone Model : *${model}*\n• OS Version : *${OSVersion}*\n• WhatsApp Version : *${WAVersion}*\n• Battery : *${battery}*\n\n${global.footerText}`
    return conn.reply(m.chat, str, m)
  }
}