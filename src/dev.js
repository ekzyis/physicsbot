#!/usr/bin/node

const { log_info, log_msg } = require("./util");

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
/**
 * @param {String} item.emojiName               Name of emoji in list `emojis`
 * @param {String} item.roleName                Name of role associated to emoji
 */
const emojis = JSON.parse(fs.readFileSync("exclude/emoji/emoji.json", "utf8"));

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
    if (!msg.guild) return;
    if (msg.content === "!newmember" && msg.guild.id === test.guild.id) {
        client.emit("guildMemberAdd", test.guild.member(msg.author));
    }
});

client.on("messageReactionAdd", (reaction, user) => {
    if (user.bot) return;
    log_info(
        `${
            user.tag
        } reacted with ${reaction.emoji.toString()} to msg with id: ${
            reaction.message.id
        }!`
    );
    if (reaction.message.id === roles.embed.id) {
        let associatedRoleId = roles.map[reaction.emoji.name].id;
        if (associatedRoleId) {
            let roleName = test.guild.roles.get(associatedRoleId).name;
            let guildMember = test.guild.member(user);
            guildMember
                .addRole(associatedRoleId)
                .then(member => {
                    log_info(
                        `Set role ${roleName} (ID: ${associatedRoleId}) to ${
                            member.displayName
                        }`
                    );
                })
                .catch(console.error);
        }
    }
});

client.on("messageReactionRemove", (reaction, user) => {
    if (user.bot) return;
    log_info(
        `${
            user.tag
        } removed reaction ${reaction.emoji.toString()} from msg with id: ${
            reaction.message.id
        }!`
    );
    if (reaction.message.id === roles.embed.id) {
        let associatedRoleId = roles.map[reaction.emoji.name].id;
        if (associatedRoleId) {
            let roleName = test.guild.roles.get(associatedRoleId).name;
            let guildMember = test.guild.member(user);
            guildMember
                .removeRole(associatedRoleId)
                .then(member => {
                    log_info(
                        `Removed role ${roleName} (ID: ${associatedRoleId} from ${
                            member.displayName
                        }`
                    );
                })
                .catch(console.error);
        }
    }
});

const test = {};
const roles = {};
const lecture = {};
client.on("ready", () => {
    log_info(
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

// TODO Init lectures embed
const init_overviewChannel = () => {
    // Get emoji objects from guild and map them to roles ids
    roles.map = {};
    let rolesCollection = test.guild.roles;
    let emojiNames = [];
    emojis.forEach(item => {
        emojiNames.push(item.emojiName);
        roles.map[item.emojiName] = {
            id: rolesCollection.find(role => role.name === item.roleName).id,
            name: item.roleName
        };
    });
    roles.emojis = test.guild.emojis
        .array()
        .filter(emoji => emojiNames.includes(emoji.name));
    // Create a "emoji string" for usage in roles embed
    let emojiString = "";
    roles.emojis.forEach(emoji => {
        emojiString += `<@&${
            roles.map[emoji.name].id
        }>: ${emoji.toString()}\n\n`;
    });
    // Barebone roles embed
    roles.embed = {
        title: `***Rollen***`,
        description:
            `\nWillkommen im Rollen-Verteiler, hier könnt ihr auswählen was ihr studiert ` +
            `und welche Kurse ihr belegt in dem ihr entsprechend auf diese Nachricht *reagiert*.\n\n` +
            `Das ganze dient zur Übersicht und schaltet nur für die einzelnen Kurse bestimmte Text[- und Sprach]kanäle ` +
            `frei, die ihr jetzt noch nicht sehen könnt.\n\n` +
            `Reagieren ist ganz einfach: Klickt einfach auf die einzelnen Symbole unter diesem Post. ` +
            `Dadurch erscheinen neue Textkanäle, in denen du dich mit deinen Kommilitonen austauschen kannst.\n` +
            `Dies ist auch reversibel. Ihr könnt hier auch eine Reaktion durch einfaches Klicken wieder entfernen, ` +
            `um z.B. über LA oder ANA nicht mehr informiert zu werden, bzw. diese Kanäle nicht mehr zu sehen.\n\n` +
            `Probiert es ruhig aus, ihr könnt nichts falsch machen, nichts ist in Stein gemeißelt. Bei Fragen sind alle in der <#` +
            test.defaultChannel.id +
            `> sehr hilfsbereit!\n\n` +
            `${emojiString}`,
        id: undefined
    };
    // Check if there is already a roles embed in overview channel
    find_embed(test.overviewChannel, roles.embed.title)
        .then(id => {
            log_info(`roles.embed found!`);
            roles.embed.id = id;
        })
        .catch(() =>
            test.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: roles.embed.title,
                        description: roles.embed.description
                    })
                )
                .then(msg => {
                    log_info(`new roles.embed sent!`);
                    log_msg(msg);
                    roles.embed.id = msg.id;
                })
                .catch(console.error)
        )
        .finally(() => {
            log_info(`roles.embed.id = ` + roles.embed.id);
            // React with emotes so users can just click on them
            test.overviewChannel
                .fetchMessages({ limit: 5 })
                .then(messages => {
                    let embed = messages.get(roles.embed.id);
                    roles.emojis.forEach(emoji => {
                        embed.react(emoji).catch(console.error);
                    });
                })
                .catch(console.error);
        });
    // Barebone lectures embed
    lecture.embed = {
        title: `***Vorlesungsübersicht***`,
        description: "*** WIP ***",
        id: undefined
    };
    // Check if there is already a lecture embed in overview channel
    find_embed(test.overviewChannel, lecture.embed.title)
        .then(id => {
            log_info(`lectures.embed found!`);
            lecture.embed.id = id;
        })
        .catch(() =>
            test.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: lecture.embed.title,
                        description: lecture.embed.description
                    })
                )
                .then(msg => {
                    log_info(`new lectures.embed sent!`);
                    log_msg(msg);
                    lecture.embed.id = msg.id;
                })
                .catch(console.error)
        )
        .finally(() => {
            log_info(`lectures.embed.id = ` + lecture.embed.id);
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

log_info("Logging in...");
client.login(token).catch(console.error);

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
