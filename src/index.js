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
const botData = JSON.parse(fs.readFileSync("../exclude/bot.json", "utf8"));
const token = botData.token;
/**
 * @param {Object} server                       Holds private data about servers
 * @param {Object} server.physics               Holds private data about physics server
 * @param {string} server.guildId               Id of server
 * @param {string} server.defaultChannelId      Id of channel where new members arrive
 * @param {string} server.rulesChannelId        Id of channel where rules are listed
 */
const server = JSON.parse(fs.readFileSync("../exclude/server.json", "utf8"));

console.log("Logging in...");

client.on("guildMemberAdd", member => {
    // Check if member joined our physics guild even though this bot may never join another guild
    // NOTE this is unecessary since bot is only part of one guild but this seems good practice to me
    if (member.guild.id === physics.guild.id) {
        let greeting =
            `Willkommen <@` + member.id + `> auf ${physics.guild.name}.\n`;
        greeting +=
            `Es wäre cool, wenn du dir die <#` +
            physics.rulesChannel.id +
            `> ansiehst, bevor du dich hier umschaust :slight_smile:`;
        physics.defaultChannel
            .send(greeting)
            .then(msg => {
                console.log(
                    `${physics.guild.name}@${
                        physics.defaultChannel.name
                    }: ${msg}`
                );
            })
            .catch(reason => console.error(reason));
    }
});

/**
 * @param {Object}                          physics                     Object for easier access to server data
 * @param {module:discord.js.Guild}         physics.guild               Guild object of server
 * @param {module:discord.js.TextChannel}   physics.defaultChannel      Default channel of server where new members arrive
 * @param {module:discord.js.TextChannel}   physics.rulesChannel        Rules channel of server
 */
const physics = {};
client.on("ready", () => {
    console.log(`${client.user.tag} is now logged in!`);
    client.user
        .setActivity("LHC live stream", { type: "WATCHING" })
        .catch(reason => {
            console.error(reason);
        });
    physics.guild = client.guilds.get(server.physics.guildId);
    physics.defaultChannel = physics.guild.channels.get(
        server.physics.defaultChannelId
    );
    physics.rulesChannel = physics.guild.channels.get(
        server.physics.rulesChannelId
    );
    console.log(physics);
});

client.login(token).catch(reason => {
    console.error(reason);
});

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
