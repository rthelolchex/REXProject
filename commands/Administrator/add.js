const i18n = require("i18n");

module.exports = {
    name: ["add"],
    description: i18n.__('group.add.description'),
    tags: "admin",
    group: true,
    admin: true,
    botAdmin: true,
    maintenance: true,
    async run(m, { conn, text }) {

    }
}