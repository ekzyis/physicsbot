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
 * @param {Object} server.test                  Holds private data about test server
 * @param {string} server.guildId               Id of server
 * @param {string} server.defaultChannelId      Id of channel where new members arrive
 * @param {string} server.rulesChannelId        Id of channel where rules are listed
 */
const server = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));

if (process.env.NODE_ENV === "production") {
    client.on("guildMemberAdd", member => {
        // Check if member joined our physics guild
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
}

/**
 * @param {Object}                          physics                 Object for easier access to physics server data
 * @param {Object}                          test                    Object for easier access to test server data
 * @param {module:discord.js.Guild}         obj.guild               Guild object of server
 * @param {module:discord.js.TextChannel}   obj.defaultChannel      Default channel of server where new members arrive
 * @param {module:discord.js.TextChannel}   obj.rulesChannel        Rules channel of server
 */
const physics = {};
const test = {};
client.on("ready", () => {
    console.log(`${client.user.tag} is now logged in!`);
    client.user
        .setActivity("LHC live stream", { type: "WATCHING" })
        .catch(reason => {
            console.error(reason);
        });
    if (process.env.NODE_ENV === "production") {
        physics.guild = client.guilds.get(server.physics.guildId);
        physics.defaultChannel = physics.guild.channels.get(
            server.physics.defaultChannelId
        );
        physics.rulesChannel = physics.guild.channels.get(
            server.physics.rulesChannelId
        );
        // console.log(physics);
    }
    if (process.env.NODE_ENV === "development") {
        test.guild = client.guilds.get(server.test.guildId);
        test.defaultChannel = test.guild.channels.get(
            server.test.defaultChannelId
        );
        test.rulesChannel = test.guild.channels.get(server.test.rulesChannelId);
        // console.log(test);
    }
});

console.log("Logging in...");
client.login(token).catch(reason => {
    console.error(reason);
});

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
