// Soon i code it :), first lemme code the banner icon
const { MessageType } = require('@adiwajshing/baileys')
const { spawn } = require('child_process')
const fs = require('fs')
const i18n = require('i18n')

module.exports = {
    name: ["menu", "help"],
    tags: "main",
    description: i18n.__("menu.description"),
    group: false,
    admin: false, 
    botAdmin: false, 
    owner: false, 
    async run(m, { conn, args, text, usedPrefix }) {
      let teks = `${args[0]}`.toLowerCase()
        let tags = {
            'admin': "Administrator",
            'downloader': "Downloader",
            'gi': "Genshin Impact",
            "info": "Info",
            'main': "Main",
            'owner': 'Owner',
            'sticker': 'Sticker',
            'internet': "Internet",
            'tools': "Tools",
            'random': "Random",
            'premium': "Premium"
        }
        let arrayMenu = ["all"]
        let listMenu = []
        for (let list in tags) {
          let rows = {
            "title": tags[list],
            "description": "",
            "rowId": `${usedPrefix}menu ${list}`
          }
          listMenu.push(rows)
          arrayMenu.push(list)
        }
        if (teks == "all") tags
        if (teks == "admin") tags = {
          "admin": "Administrator"
        }
        if (teks == "downloader") tags = {
          "downloader": "Downloader"
        }
        if (teks == "gi") tags = {
          "gi": "Genshin Impact"
        }
        if (teks == "info") tags = {
          "info": "Info"
        }
        if (teks == "main") tags = {
          "main": "Main"
        }
        if (teks == "owner") tags = {
          "owner": "Owner"
        }
        if (teks == "sticker") tags = {
          "sticker": "Sticker"
        }
        if (teks == "internet") tags = {
          "internet": "Internet"
        }
        if (teks == "random") tags = {
          "random": "Random"
        }
        if (teks == "premium") tags = {
          "premium": "Premium"
        }
        if (teks == "tools") tags = {
          "tools": "Tools"
        }
        if (!arrayMenu.includes(teks)) teks = "none"
        if (teks == "none")  {
          return conn.relayWAMessage(conn.prepareMessageFromContent(m.chat, {
            "listMessage": {
              "title": "Please click at down below.",
              "description": global.footerText,
              "buttonText": "Tap here",
              "listType": "SINGLE_SELECT",
              "sections": [{
                  "rows": listMenu
                }], "contextInfo": {
                  "stanzaId": m.key.id,
                  "participant": m.sender,
                  "quotedMessage": m.message
                }
            }
          }, {}), { waitForAck: true })
        }
        let pushname = conn.getName(m.sender)
        let userinfo = i18n.__mf("menu.user", { pushname: pushname })
        let header = ">>> *%category* <<<"
        let middle = "▢ _*%command*_ %isMaintenance\n```%description```"
        let footer = ">=================<"
        let help = Object.values(global.commands).filter(cmd => !cmd.disabled).map(cmd => {
            return {
                help: Array.isArray(cmd.name) ? cmd.name.join(`, ${global.prefix}`) : [cmd.name],
                tags: Array.isArray(cmd.tags) ? cmd.tags : [cmd.tags],
                description: cmd.description ? cmd.description : i18n.__('!desc'),
                maintenance: cmd.maintenance ? true : false
            }
        })
        let groups = {}
        for (let tag in tags) {
            groups[tag] = []
            for (let cmd of help)
            if (cmd.tags && cmd.tags.includes(tag))
            if (cmd.help) groups[tag].push(cmd)
        }
        let body =  [
            userinfo,
            ...Object.keys(tags).map(tag => {
                return header.replace(/%category/g, tags[tag]) + '\n' + [
                    ...help.filter(cmd => cmd.tags && cmd.tags.includes(tag) && cmd.help).map(cmd => {
                        return middle.replace(/%command/g, global.prefix + cmd.help)
                        .replace(/%isMaintenance/g, cmd.maintenance ? "(Maintenance)" : "")
                        .replace(/%description/g, cmd.description ? cmd.description : i18n.__('!desc'))
                        .trim()
                    }),
                ].join('\n\n') + '\n' + footer
            }),
        ].join('\n\n')
        let picBanner = (teks == "all") ? "All" : tags[teks]
        spawn('convert', [
            './src/bg.png',
            '-gravity',
            'Center',
            '-font',
            './src/poppins.ttf',
            '-pointsize',
            '100',
            '-fill',
            '#FFFFFF',
            '-annotate',
            '0',
            picBanner + ".",
            './src/menu_tags.png'
        ])
        .on('exit', async () => {
           await conn.send2ButtonLoc(m.chat, await fs.readFileSync('./src/menu_tags.png'), body, global.footerText, 'Owner bot', `${global.prefix}owner`, 'Donasi', `${global.prefix}donate`)
        })
    }
}