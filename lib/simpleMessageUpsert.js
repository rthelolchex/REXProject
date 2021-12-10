exports.simpleMessageUpsert = async(conn, m) => {
    if (!m) return m
    if (m.key) {
        m.chat = m.key.remoteJid
        m.sender = m.fromMe ? conn.user.id : m.key.participant ? m.key.participant : m.participant ? m.participant : m.chat
        m.isGroup = m.chat.endsWith('@g.us')
        m.isBaileysMD = m.key.id.endsWith("BAE5")
    }
    if (m.message) {
        m.messageType = Object.keys(m.message)[0]
        m.messageContent = m.message[m.messageType]
        if (m.messageType === 'ephemeralMessage') {
            exports.simpleMessageUpsert(conn, m.messageContent)
            m.messageType = m.messageContent.messageType
            m.messageContent = m.messageContent.messageContent
        }
        let quoted = m.quoted = m.messageContent.contextInfo ? m.messageContent.contextInfo.quotedMessage : null
        m.mentionedJid = m.messageContent.contextInfo ? m.messageContent.contextInfo.mentionedJid : []
        m.text = m.messageContent.text || m.messageContent.caption || m.messageContent
    }
    return m
}