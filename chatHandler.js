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
            m.exp = 0
            m.limit = false
            try {
              let user = global.db.data.users[m.sender]
              if (user) {
                if (!('name' in user)) user.name = this.getName(m.sender)
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.limit)) user.limit = 10
                if (!isNumber(user.level)) user.level = 1
              } else global.db.data.users[m.sender] = {
                name: this.getName(m.sender),
                exp: 0,
                limit: 10,
                level: 1
              }
            } catch (e) {
              console.error(e)
            }
            try {
                if (m.isBaileys) return
                m.exp += Math.ceil(Math.random() * 10)
                let isROwner = [global.conn.user.jid, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
                let isOwner = isROwner || m.fromMe
                let isPremium = isROwner || global.premium.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
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
                        let isAccept = typeof commands.name === 'string' ? commands.name === commandName : Array.isArray(commands.name) ? commands.name.some(cmd => cmd === commandName) : commands.name instanceof RegExp ? commands.name.test(commandName) : false
                        if (!isAccept) continue
                        if (commands.group && !m.isGroup) {
                            conn.reply(m.chat, i18n.__("failed.notGroup"), m)
                            continue;
                        }
                        if (commands.rowner && commands.owner && !(isROwner || isOwner)) {
                            conn.reply(m.chat, i18n.__('failed.owner'), m)
                            continue;
                        }
                        if (commands.rowner && !isROwner) {
                            conn.reply(m.chat, i18n.__('failed.owner'), m)
                            continue;
                        }
                        if (commands.owner && !isOwner) {
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
                        if (commands.premium && !isPremium) {
                            conn.reply(m.chat, i18n.__('failed.notPremium'))
                            continue
                        }
                        if (commands.private && m.isGroup) {
                            conn.reply(m.chat, i18n.__('failed.privateOnly'), m)
                            continue
                        }
                        m.isCommand = true
                        m.command = commandName
                        let xp = 'exp' in commands ? parseInt(commands.exp) : 17 // earning xp per commands
                        
                        m.exp += xp
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
                            isPremium,
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
        } finally {
          let user
          if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
              user.exp += m.exp
              user.limit -= m.limit * 1
            }
          }
        }
        try {
            if (opts['debug']) console.log(m)
            require('./lib/messageLog')(this, m)
        } catch (e) {
            console.log(m, e)
        }
    }
}