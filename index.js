console.clear()
console.log("Initializing...")
const { WAConnection: _WAConnection } = require('@adiwajshing/baileys')
const simpleChatUpdate = require('./lib/simpleChatUpdate')
const WAConnection = simpleChatUpdate.WAConnection(_WAConnection)
const fs = require('fs')
const CFonts = require('cfonts')
const chatHandler = require('./chatHandler')
const messageUpsertHandler = require('./messageUpsertHandler')
const { startspin, success, info } = require('./lib/spinner')
const { greenBright } = require('chalk')
const yargs = require('yargs/yargs')
const path = require("path")
const Readline = require('readline')
const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, delay } = require('@adiwajshing/baileys-md')
require('./lib/i18n')

// Slogan when initializing the bot
CFonts.say('REXProject', {
    font: 'block',
    align: "center",
})

CFonts.say('REXProject by rthelolchex', {
    font: 'console',
    align: "center",
})

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.owner = require('./users.json').owner
global.premium = require('./users.json').premium
global.isMultiDevice = false

async function InitializeWA() {
    global.conn = new WAConnection()
    let authinfo = './session.data.json'
    conn.logger.level = 'warn'
    if (fs.existsSync(authinfo)) conn.loadAuthInfo(authinfo)
    conn.on('connecting', () => {
        if (conn.isReconnecting === true) {
            startspin("2", "Reconnecting...")
        } else startspin("2", "Trying to connect.")
    })
    conn.on('qr', () => {
        info('2', "Authenticate to continue")
    })
    conn.on('open', () => {
        success("2", `${conn.user.name} ready!`)
        // startspin("2", "Waiting for new messages")
    })
    conn.on('close', DisconnectReason => {
        console.log(`[ ! ] Disconnected, reason ${DisconnectReason.reason}, reconnecting...`)
        conn.isReconnecting = DisconnectReason.isReconnecting
    })
    conn.handler = chatHandler.handler
    conn.on('chat-update', conn.handler)
    conn.connect().then(async () => {
      // Initialize database
      global.db = null
      if (!fs.existsSync("./database.json")) {
        database = {
          users: {},
          chats: {},
          stats: {}
        }
        fs.writeFileSync("./database.json", JSON.stringify(database, null, "\t"))
        global.db = require("./database.json")
      } else global.db = require("./database.json")
        fs.writeFileSync(authinfo, JSON.stringify(conn.base64EncodedAuthInfo()), null, '\t')
    })
}

async function InitializeWAMD() {
    global.isMultiDevice = true
    const NoPinoLogger = {
        log: function () {},
        info: function () {},
        error: function () {},
        trace: function () {},
        debug: function () {}
    }
    var loadAuthState = useSingleFileAuthState('./session_md.data.json'), state = loadAuthState.state, saveState = loadAuthState.saveState
    global.conn = makeWASocket({
        printQRInTerminal: true,
        logger: NoPinoLogger,
        auth: state
    })
    conn.ev.on('connection.update', function (update) {
        var _a, _b;
        var connection = update.connection, lastDisconnect = update.lastDisconnect;
        if (connection === 'close') {
            // reconnect if not logged out
            if (((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== DisconnectReason.loggedOut) {
                InitializeWAMD();
            }
            else {
                console.log('connection closed');
            }
        }
        console.log('connectionUpdate', update);
        if (update.connection === 'connecting') startspin("2", "Trying to connect.")
        if (update.qr) info('2', "Authenticate to continue")
        if (update.connection === 'open') success("2", "Your bot is ready!")
    })
    conn.messageUpsertHandler = messageUpsertHandler.handler
    conn.ev.on('messages.upsert', conn.messageUpsertHandler)
    conn.ev.on('creds.update', saveState);
    
    return conn;
}

async function start() {
    // Initialize commands
    global.commands = {}
    fs.readdirSync('./commands/').forEach((dir) => {
        let commands = fs.readdirSync(`./commands/${dir}`).filter((files) =>
        files.endsWith(".js")
      );
      for (let file of commands) {
          global.commands[file] = require(`./commands/${dir}/${file}`)
          nocache(`./commands/${dir}/${file}`, module => {
            console.log(`>> Reloading file ${module}.`)
            global.commands[file] = require(`./commands/${dir}/${file}`)
          })
      }
    })
    console.log(Object.keys(global.commands))
    console.log(greenBright(`Loaded ${Object.keys(global.commands).length} commands.\n`))
    let rlAnswer = false
    function rlQuestion() {
        rl.question("Hey owner, welcome to our script!\nWhat do you want to initialize?\n\n1. WhatsApp Web\n2. Whatsapp Web Multi-Device\n\nType : ", function(name) {
            switch(name) {
                case '1':
                    rlAnswer = '1'
                    rl.close()
                    break
                case '2':
                    rlAnswer = '2'
                    rl.close()
                    break
                default:
                    console.clear()
                    console.log("Invalid input, please try again!")
                    return rlQuestion()
            }
        })
    }
    rlQuestion()
    rl.on('close', function() {
        switch (rlAnswer) {
            case '1':
                    console.log("Initializing WhatsApp Web...")
                    InitializeWA()
                    break
                case '2':
                    console.log("Initializing WhatsApp Web Multi-Device...")
                    InitializeWAMD()
                    break
                default:
                    process.exit(0)
        }
    })
    // Saving database every minute
    setInterval(async () => {
      if (global.db) await fs.writeFileSync("./database.json", JSON.stringify(global.db, null, "\t"))
    }, 60 * 1000)
}

/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, call = () => { }) {
    fs.watchFile(require.resolve(module), async () => {
        await uncache(require.resolve(module))
        call(module)
    })
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module) {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(module)]
            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

start()

process.on("exit", () => {
  if (global.db) fs.writeFileSync("./database.json", JSON.stringify(global.db, null, "\t"))
})