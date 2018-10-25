#!/usr/bin/node

const discord = require("discord.js");
/**
 * https://discord.js.org/#/docs/main/stable/class/Client
 * @type {module:discord.js.Client}
 */
const client = new discord.Client();
const fs = require("fs");

/**
 * @param {Object} botData               Holds private data about used bot
 * @param {string} botData.name          Name with discriminator
 * @param {string} botData.token         Token to login as bot
 */
const botData = JSON.parse(fs.readFileSync("exclude/bot.json", "utf8"));
const token = botData.token;
/**
 * @param {Object} server                       Holds private data about servers
 * @param {Object} server.test                  Holds private data about test server
 * @param {string} server.guildId               Id of server
 * @param {string} server.defaultChannelId      Id of channel where new members arrive
 * @param {string} server.rulesChannelId        Id of channel where rules are listed
 * @param {string} server.adminId               Id of admin
 */
const server = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));

client.on("guildMemberAdd", member => {
    if (member.guild.id === test.guild.id) {
        let greeting =
            `Willkommen <@` + member.id + `> auf ${test.guild.name}.\n`;
        greeting +=
            `Es wäre cool, wenn du dir die <#` +
            test.rulesChannel.id +
            `> ansiehst, bevor du dich hier umschaust :slight_smile:`;
        test.defaultChannel
            .send(greeting)
            .then(msg =>
                console.log(
                    `${test.guild.name}@${test.defaultChannel.name}: ${msg}`
                )
            )
            .catch(reason => console.error(reason));
    }
});
client.on("message", msg => {
    if (msg.content === "!guildMemberAdd") {
        client.emit("guildMemberAdd", test.guild.member(msg.author));
    }
});

const test = {};
client.on("ready", () => {
    console.log(
        `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
    );
    test.guild = client.guilds.get(server.test.guildId);
    test.defaultChannel = test.guild.channels.get(server.test.defaultChannelId);
    test.rulesChannel = test.guild.channels.get(server.test.rulesChannelId);
    // console.log(test);
});

console.log("Logging in...");
client.login(token).catch(reason => {
    console.error(reason);
});

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
