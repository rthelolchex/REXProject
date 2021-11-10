require('./config.js')
const simpleChatUpdate = require('./lib/simpleChatUpdate')
const { MessageType } = require('@adiwajshing/baileys')
const util = require('util')
const chalk = require('chalk')
const i18n = require('i18n')
const isNumber = x => typeof x === 'number' && !isNaN(x)
module.exports = {
    async handler(chatUpdate) {
        if (!chatUpdate.hasNewMessage) return
        if (!chatUpdate.messages && !chatUpdate.count) return
        let m = chatUpdate.messages.all()[0]
        try {
            simpleChatUpdate.chatUpdate(this, m)
            // Thanks to Nurutomo for database JSON
            try {
                let user
                if (user = global.DATABASE._data.users[m.sender]) {
                    if (!isNumber(user.exp)) user.exp = 0
                    if (!isNumber(user.limit)) user.limit = 10
                    if (!'name' in user) user.name = conn.getName(m.sender)
                } else global.DATABASE._data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    name: conn.getName(m.sender)
                }
            } catch (e) {
                console.log(e, global.DATABASE.data)
            }
            try {
                if (m.isBaileys) return
                let isROwner = conn.user.jid.includes(m.sender)
                let groupMetadata = m.isGroup ? conn.chats.get(m.chat).metadata || await conn.groupMetadata(m.chat) : {} || {}
                let participants = m.isGroup ? groupMetadata.participants : [] || []
                let user = m.isGroup ? participants.find(u => u.jid == m.sender) : {} 
                let bot = m.isGroup ? participants.find(u => u.jid == this.user.jid) : {} 
                let isAdmin = user.isAdmin || user.isSuperAdmin || false 
                let isBotAdmin = bot.isAdmin || bot.isSuperAdmin || false 
                for (let file in global.commands) {
                    let commands = global.commands[file]
                    if (typeof m.text !== 'string') m.text = '';
                    let usedPrefix
                    let _prefix = commands.customPrefix ? commands.customPrefix : conn.prefix ? conn.prefix : global.prefix
                    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                    let match = (typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[1])
                    if ((usedPrefix = (match[0] || '')[0])) {
                        let cmd = m.text.startsWith(global.prefix) ? m.text : ''
                        let commandName = cmd.slice(global.prefix.length).trim().split(/ +/).shift().toLowerCase()
                        let args = cmd.trim().split(/ +/).slice(1)
                        let text = args.join` `
                        let isAccept = typeof commands.name === 'string' ? commands.name === commandName : Array.isArray(commands.name) ? commands.name.some(cmd => cmd === commandName) : false
                        if (!isAccept) continue
                        if (commands.group && !m.isGroup) {
                            conn.reply(m.chat, i18n.__("failed.notGroup"), m)
                            continue;
                        }
                        if (commands.owner && !isROwner) {
                            conn.reply(m.chat, i18n.__("failed.owner"), m)
                            continue;
                        }
                        if (commands.admin && !isAdmin) {
                            conn.reply(m.chat, i18n.__("failed.notAdmin"), m);
                            continue;
                        }
                        if (commands.botAdmin && !isBotAdmin) {
                            conn.reply(m.chat, i18n.__("failed.notBotAdmin"), m);
                            continue;
                        }
                        if (commands.maintenance && !isOwner) {
                            conn.reply(m.chat, i18n.__('maintenance'), m)
                            continue
                        }
                        m.isCommand = true
                        m.command = commandName
                        let extra = {
                            usedPrefix,
                            text,
                            args,
                            commandName,
                            conn: this,
                            participants,
                            groupMetadata,
                            user,
                            bot,
                            isROwner,
                            isAdmin,
                            isBotAdmin,
                            chatUpdate
                        }
                        try {
                            await commands.run.call(this, m, extra)
                        } catch (e) {
                            console.log(`${chalk.redBright(`>> ${util.format(e)}`)}`)
                            conn.sendMessage(m.chat, util.format(e), MessageType.text, { quoted: m })
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }
        } catch (e) {
            console.log(e)
        }
        try {
            require('./lib/messageLog')(this, m)
        } catch (e) {
            console.log(m, e)
        }
    }
}