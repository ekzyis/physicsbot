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
 * @param {string} server.rulesChannelId        Id of channel where rules are listed (access: only admin)
 * @param {string} server.overviewChannelId     Id of bot channel to list information about lectures (access: only bot)
 * @param {string} server.adminId               Id of admin
 */
const server = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));
const emojiData = JSON.parse(
    fs.readFileSync("exclude/emoji/emoji.json", "utf8")
);

client.on("guildMemberAdd", member => {
    if (member.guild.id === test.guild.id) {
        let embedGreeting = {
            embed: {
                thumbnail: {
                    url: member.user.avatarURL
                },
                title: `Willkommen ${member.user.tag} auf ${
                    test.guild.name
                }!\n`,
                description:
                    `Es wäre cool, wenn du dir die <#` +
                    test.rulesChannel.id +
                    `> ansiehst, bevor du dich hier umschaust :slight_smile:\n` +
                    `Außerdem verwalte ich hier auf dem Server die Rollen für die einzelnen Vorlesungen. Diese kannst du dir in <#` +
                    test.overviewChannel.id +
                    `> ansehen. Sag mir dort am besten gleich, welche Vorlesungen du besuchst, damit ich dir die jeweiligen Kanäle freischalten kann!`
            }
        };
        test.defaultChannel
            .send(`<@` + member.id + `>`, embedGreeting)
            .then(log_msg)
            .catch(console.error);
    }
});
client.on("message", msg => {
    if (msg.content === "!newmember" && msg.guild.id === test.guild.id) {
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
    test.overviewChannel = test.guild.channels.get(
        server.test.overviewChannelId
    );
    init_overviewChannel();
    // console.log(test);
});

// TODO Improve embed data for roles and lectures
// TODO Listen for emojis and set roles
const init_overviewChannel = () => {
    // Get emoji objects from guild
    let emojis = test.guild.emojis
        .array()
        .filter(emoji => emojiData.names.includes(emoji.name));
    // Create a "emoji string" for usage in rolesEmbed
    let emojiString = "";
    emojis.forEach((data, index) => {
        if (index < emojis.length - 1)
            emojiString += `<:${data.name}:${data.id}>, `;
        else emojiString += `& <:${data.name}:${data.id}>`;
    });
    // Barebone roles embed
    let rolesEmbed = {
        title: `***Rollen***`,
        description: `Hier könnt ihr mit den Emojis (${emojiString}) ... **WORK IN PROGRESS**`,
        id: undefined
    };
    // Check if there is already a roles embed in overview channel
    find_embed(test.overviewChannel, roles.msg.title)
        .then(id => {
            log_info(`roles.msg found!`);
            roles.msg.id = id;
        })
        .catch(() =>
            test.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: roles.msg.title,
                        description: roles.msg.description
                    })
                )
                .then(msg => {
                    log_info(`new roles.msg sent!`);
                    roles.msg.id = msg.id;
                })
                .catch(console.error)
        )
        .finally(() => {
            log_info(`roles.msg.id = ` + roles.msg.id);
        });
    // Barebone lectures embed
    let lecturesOverview = {
        msg: {
            title: `***Vorlesungsübersicht***`,
            description: "",
            id: undefined
        }
    };
    // Check if there is already a lecture embed in overview channel
    find_embed(test.overviewChannel, lecturesOverview.msg.title)
        .then(id => {
            log_info(`lecturesOverview.msg found!`);
            lecturesOverview.msg.id = id;
        })
        .catch(() =>
            test.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: lecturesOverview.msg.title,
                        description: lecturesOverview.msg.description
                    })
                )
                .then(msg => {
                    log_info(`new lecturesOverview.msg sent!`);
                    lecturesOverview.msg.id = msg.id;
                })
                .catch(console.error)
        )
        .finally(() => {
            log_info(`lecturesOverview.msg.id = ` + lecturesOverview.msg.id);
        });
};

// Resolve id of message when found else reject
async function find_embed(channel, title) {
    return channel.fetchMessages({ limit: 5 }).then(messages => {
        return new Promise(function(resolve, reject) {
            messages.array().forEach(msg => {
                if (
                    msg.embeds.some(embed => {
                        return embed.title === title;
                    })
                ) {
                    resolve(msg.id);
                }
            });
            reject("Message not found");
        });
    });
}

const log_msg = msg => {
    console.log(`${msg.guild.name}@${msg.channel.name}: ${msg}`);
};

const log_info = info => {
    console.log(`INFO@[${timestamp()}]: ${info}`);
};

const timestamp = () => {
    let date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
    }, ${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;
};

console.log("Logging in...");
client.login(token).catch(console.error);

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
