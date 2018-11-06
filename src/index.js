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
 * @param {Object} server.physics               Holds private data about physics server
 * @param {string} server.guildId               Id of server
 * @param {string} server.defaultChannelId      Id of channel where new members arrive
 * @param {string} server.rulesChannelId        Id of channel where rules are listed
 * @param {string} server.adminId               Id of admin
 */
const server = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));

client.on("guildMemberAdd", member => {
    // Check if member joined our physics guild
    if (member.guild.id === physics.guild.id) {
        let embedGreeting = {
            embed: {
                thumbnail: {
                    url: member.user.avatarURL
                },
                title: `Willkommen ${member.user.tag} auf ${
                    physics.guild.name
                }!\n`,
                description:
                    `Es wäre cool, wenn du dir die <#` +
                    physics.rulesChannel.id +
                    `> ansiehst, bevor du dich hier umschaust :slight_smile:`
            }
        };
        physics.defaultChannel
            .send(`<@` + member.id + `>`, embedGreeting)
            .then(log_msg)
            .catch(console.error);
    }
});

/**
 * @param {Object}                          physics                 Object for easier access to physics server data
 * @param {module:discord.js.Guild}         obj.guild               Guild object of server
 * @param {module:discord.js.TextChannel}   obj.defaultChannel      Default channel of server where new members arrive
 * @param {module:discord.js.TextChannel}   obj.rulesChannel        Rules channel of server
 */
const physics = {};
client.on("ready", () => {
    console.log(
        `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
    );
    client.user
        .setActivity("LHC live stream", { type: "WATCHING" })
        .catch(console.error);
    physics.guild = client.guilds.get(server.physics.guildId);
    physics.defaultChannel = physics.guild.channels.get(
        server.physics.defaultChannelId
    );
    physics.rulesChannel = physics.guild.channels.get(
        server.physics.rulesChannelId
    );
    // console.log(physics);
});

client.on("message", msg => {
    if (msg.content === "!newmember" && msg.guild.id === physics.guild.id) {
        client.emit("guildMemberAdd", physics.guild.member(msg.author));
    }
});

const log_msg = msg => {
    console.log(`${msg.guild.name}@${msg.channel.name}: ${msg}`);
};

console.log("Logging in...");
client.login(token).catch(console.error);

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
