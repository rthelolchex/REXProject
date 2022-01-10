const chalk = require('chalk')
const { red, redBright, black, bgYellowBright, yellowBright, yellow, cyan, cyanBright, greenBright, green, bgYellow } = chalk
module.exports = async(conn, m) => {
    let user = conn.user
    let time = (m.messageTimestamp ? new Date(1000 * (m.messageTimestamp.low || m.messageTimestamp)) : new Date).toTimeString()
    let info = `=> ${redBright(user.phone.device_manufacturer, user.phone.device_model)} | ${greenBright(`WhatsApp Version ${user.phone.wa_version}`)}`.trim()
    let message = `=> [${m.isBaileys ? "BOT" : "MSG"}] ${conn.getName(m.sender) ? conn.getName(m.sender) : m.sender} to ${conn.getName(m.chat) ? conn.getName(m.chat) : m.chat} | ${m.messageType ? m.messageType.replace(/message$/i, '').replace('audio', m.messageContent.ptt ? 'PTT' : 'audio').replace(/^./, v => v.toUpperCase()) : ''}`
    let command = `=> [BOT] Executing ${greenBright(m.command)} from ${chalk.yellow(conn.getName(m.sender) ? conn.getName(m.sender) : m.sender)} in ${cyanBright(conn.getName(m.chat) ? conn.getName(m.chat) : m.chat)}`
    console.log(info)
    console.log(m.isCommand ? command : message)
    console.log()
}