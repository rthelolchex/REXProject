const gi = require('@rthelolchex/genshininfo_scraper')
const i18n = require('i18n')
const axios = require('axios')
module.exports = {
    name: "gigetcookie",
    tags: "gi",
    description: i18n.__('gi.getcookie.description'),
    private: true,
    async run(m, { conn, text }) {
        if (!text) throw i18n.__('gi.getcookie.cookieNotIncluded')
        let user = global.db.users[m.sender]
        try {
            const { data: html } = await axios.get('https://api-os-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=', {
                headers: {
                    'User-Agent': "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E150",
                    'Referer': `https://webstatic-sea.mihoyo.com/ys/event/signin-sea/index.html?act_id=e202102251931481`,
                    "Accept-Encoding": "gzip, deflate, br",
                    'Cookie': text
                }
            })
            if (html) {
                let userData = html.data.list[0]
                let str = `
**********************
Info has been founded!
**********************
=> Nickname: ${userData.nickname}
=> UID: ${userData.game_uid}
=> AR: ${userData.level}
=> Server: ${userData.region_name}

_Your user information has stored to our database, please use it wisely!_
                `.trim()
                conn.reply(m.chat, str, m)
                user.GICookie = text
                user.GIUID = userData.game_uid
                user.GINickname = userData.nickname
            }
        } catch (e) {
            console.log(e)
            return conn.reply(m.chat, e.message, m)
        }
    }
}