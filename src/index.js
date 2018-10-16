#!/usr/bin/node

const discord = require("discord.js");
/**
 * https://discord.js.org/#/docs/main/stable/class/Client
 * @type {module:discord.js.Client}
 */
const client = new discord.Client();
const fs = require("fs");

/**
 * @param {object} botData               Holds private data about used bot
 * @param {string} botData.name          Name with discriminator
 * @param {string} botData.token         Token to login as bot
 */
const botData = JSON.parse(fs.readFileSync("../exclude/bot.json", "utf8"));
const token = botData.token;
/**
 * @param {Object} serverData                       Holds private data about physics server
 * @param {string} serverData.guildId               Id of server
 * @param {string} serverData.defaultChannelId      Id of channel where new members arrive
 * @param {string} serverData.rulesChannelId        Id of channel where rules are listed
 */
const serverData = JSON.parse(
    fs.readFileSync("../exclude/server.json", "utf8")
);
const serverId = serverData.guildId;
const defaultChannelId = serverData.defaultChannelId;
const rulesChannelId = serverData.rulesChannelId;

console.log("Logging in...");

client.on("guildMemberAdd", member => {
    // Check if member joined our physics guild even though this bot may never join another guild
    // NOTE this is unecessary since bot is only part of one guild but this seems good practice to me
    if (member.guild.id === physicsGuild.id) {
        let greeting =
            `Willkommen <@` + member.id + `> auf ${physicsGuild.name}.\n`;
        greeting +=
            `Es wäre cool, wenn du dir die Regeln in <#` +
            rulesChannel.id +
            `> ansiehst, bevor du dich hier umschaust :slight_smile:`;
        defaultChannel
            .send(greeting)
            .then(msg => {
                console.log(
                    `${defaultChannel.guild.name}@${
                        defaultChannel.name
                    }: ${msg}`
                );
            })
            .catch(reason => console.error(reason));
    }
});

let physicsGuild;
let defaultChannel;
let rulesChannel;
client.on("ready", () => {
    console.log(`${client.user.tag} is now logged in!`);
    client.user
        .setActivity("How to rule this server 101", { type: "WATCHING" })
        .catch(reason => {
            console.error(reason);
        });
    physicsGuild = client.guilds.get(serverId);
    //console.log("physicsGuild:"); console.log(physicsGuild);
    defaultChannel = physicsGuild.channels.get(defaultChannelId);
    //console.log("defaultChannel:"); console.log(defaultChannel);
    rulesChannel = physicsGuild.channels.get(rulesChannelId);
    // console.log("rulesChannel:"); console.log(rulesChannel);
});

client.login(token).catch(reason => {
    console.error(reason);
});

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
