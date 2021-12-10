require('./config')
const simpleMessageUpsert = require('./lib/simpleMessageUpsert')
module.exports = {
    async handler(messageUpdate) {
        if (messageUpdate.type === 'prepend') return // avoid baileys-md to executing command on older messages
        if (!messageUpdate.messages[0]) return
        let m = messageUpdate.messages[0]
        try {
            simpleMessageUpsert.simpleMessageUpsert(this, m)
            console.log(m)
        } catch (e) {
            console.log(e)
        }
    }
}