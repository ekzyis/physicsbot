#!/usr/bin/node

const { log, TYPE } = require("./util");
const {
    GENERAL,
    REACTION_ADD,
    REACTION_REMOVE,
    ROLE_ADD,
    ROLE_REMOVE,
    SEND_MESSAGE,
    DELETE_MESSAGE,
    ERROR
} = TYPE;
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
 * @param {Object} server.live                  Holds private data about live server
 * @param {Object} server.test                  Holds private data about test server
 * @param {string} server.id                    Id of server
 */
const serverData = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));

client.on("guildMemberAdd", member => {
    if (member.guild.id === server.guild.id) {
        let embedGreeting = {
            embed: {
                thumbnail: {
                    url: member.user.avatarURL
                },
                title: `Willkommen ${member.user.tag} auf ${
                    server.guild.name
                }!\n`,
                description:
                    `Es wäre cool, wenn du dir die ` +
                    server.rulesChannel +
                    ` ansiehst, bevor du dich hier umschaust :slight_smile:\n` +
                    `Außerdem verwalte ich hier auf dem Server die Rollen für die einzelnen Vorlesungen. Diese kannst du dir in ` +
                    server.overviewChannel +
                    ` ansehen. Sag mir dort am besten gleich, welche Vorlesungen du besuchst, damit ich dir die jeweiligen Kanäle freischalten kann!`
            }
        };
        server.defaultChannel
            .send(member.toString(), embedGreeting)
            .then(log(SEND_MESSAGE))
            .catch(log(ERROR));
    }
});

client.on("message", msg => {
    if (!msg.guild) return;
    if (msg.guild.id === server.guild.id) {
        let guildMember = server.guild.member(msg.author);
        if (msg.content === "!newmember") {
            client.emit("guildMemberAdd", guildMember);
        } else if (msg.content === "!resetroles") {
            if (guildMember.hasPermission("MANAGE_ROLES")) {
                reset_roles_embed().then(reset_roles => {
                    msg.reply(
                        `**Folgende Rollen zurückgesetzt**:\n` +
                            `${reset_roles
                                .map(role => role.toString() + "\n")
                                .join("")}`
                    )
                        .then(msg => {
                            log(SEND_MESSAGE)(msg);
                            log(GENERAL)("Roles have been successfully reset");
                        })
                        .catch(msg =>
                            log(ERROR)("YOU REALLY HAVE A PROBLEM MATE")
                        );
                });
            } else {
                msg.reply("Keine ausreichenden Rechte.").then(
                    log(SEND_MESSAGE)
                );
            }
        }
    }
});

client.on("messageReactionAdd", (reaction, user) => {
    log(REACTION_ADD)(user, reaction);
    if (user.bot) return;
    if (reaction.message.id === roles.embed.id) {
        let associatedRole = roles.reactionRoles.find(
            item => item.emoji.id === reaction.emoji.id
        ).role;
        if (associatedRole) {
            let guildMember = server.guild.member(user);
            guildMember
                .addRole(associatedRole.id)
                .then(member => {
                    log(ROLE_ADD)(member, associatedRole);
                })
                .catch(log(ERROR));
        }
    }
});

client.on("messageReactionRemove", (reaction, user) => {
    log(REACTION_REMOVE)(user, reaction);
    if (user.bot) return;
    if (reaction.message.id === roles.embed.id) {
        let associatedRole = roles.reactionRoles.find(
            item => item.emoji.id === reaction.emoji.id
        ).role;
        if (associatedRole) {
            let guildMember = server.guild.member(user);
            guildMember
                .removeRole(associatedRole.id)
                .then(member => {
                    log(ROLE_REMOVE)(member, associatedRole);
                })
                .catch(log(ERROR));
        }
    }
});

client.on("ready", () => {
    log(GENERAL)(
        `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
    );
    client.user
        .setActivity("LHC live stream", { type: "WATCHING" })
        .catch(console.error);
    init_server();
    init_roles();
    init_overviewChannel();
});

const server = {};
const init_server = () => {
    let KEY = "";
    if (process.env.NODE_ENV === "development") {
        KEY = "test";
        server.testChannel = client.guilds
            .get(serverData[KEY].id)
            .channels.get(
                serverData[KEY].channels.find(item => item.name === "test").id
            );
    } else if (process.env.NODE_ENV === "production") {
        KEY = "live";
    }
    server.guild = client.guilds.get(serverData[KEY].id);
    server.defaultChannel = server.guild.channels.get(
        serverData[KEY].channels.find(item => item.name === "default").id
    );
    server.rulesChannel = server.guild.channels.get(
        serverData[KEY].channels.find(item => item.name === "rules").id
    );
    server.overviewChannel = server.guild.channels.get(
        serverData[KEY].channels.find(item => item.name === "overview").id
    );
    server.roles = serverData[KEY].roles;
    server.guild.emojis.forEach(item =>
        console.log(`${item.name}, ${item.id}`)
    );
};

const roles = {};
const init_roles = () => {
    roles.reactionRoles = [];
    server.guild.roles.forEach(role => console.log(`${role.name}, ${role.id}`));
    // populate reactionRoles list with given role and emoji IDs
    server.roles.forEach(item => {
        if (item.emoji) {
            roles.reactionRoles.push({
                name: item.name,
                role: server.guild.roles.get(item.role.id),
                emoji: server.guild.emojis.get(item.emoji.id)
            });
            log(GENERAL)(
                `POPULATING ...\nNAME: ${item.name},\nID OF ROLE: ${
                    item.role.id
                },\nID OF EMOJI: ${item.emoji.id}`
            );
        }
    });
    let emojiString = "";
    roles.reactionRoles.forEach(item => {
        emojiString += `${item.role.toString()}: ${item.emoji.toString()}\n\n`;
    });
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
            server.defaultChannel.id +
            `> sehr hilfsbereit!\n\n` +
            `${emojiString}`,
        id: undefined
    };
};

const reset_roles_embed = async () => {
    return new Promise(resolve => {
        server.overviewChannel
            // NOTE we assume there are only 5 messages in overview channel!
            .fetchMessages({ limit: 5 })
            .then(messages => {
                let embed = messages.get(roles.embed.id);
                embed.delete().then(msg => {
                    log(DELETE_MESSAGE)(msg);
                    let roles_to_remove = roles.reactionRoles.map(
                        item => item.role
                    );
                    reset_roles(roles_to_remove)
                        .then(members => {
                            server.overviewChannel
                                .send(
                                    new discord.RichEmbed({
                                        title: roles.embed.title,
                                        description: roles.embed.description
                                    })
                                )
                                .then(msg => {
                                    log(GENERAL)(
                                        `ROLES.EMBED SENT - ID: ${msg.id}`
                                    );
                                    roles.embed.id = msg.id;
                                    roles.reactionRoles.forEach(item => {
                                        msg.react(item.emoji).catch(log(ERROR));
                                    });
                                    log(SEND_MESSAGE)(msg);
                                    resolve(roles_to_remove);
                                })
                                .catch(log(ERROR));
                        })
                        .catch(log(ERROR));
                });
            })
            .catch(log(ERROR));
    });
};

const reset_roles = async roles_to_remove => {
    return new Promise(resolve => {
        roles_to_remove.forEach(role =>
            log(GENERAL)(
                "Resetting role " + role.name + ", ID: " + role.id + " ..."
            )
        );
        Promise.all(
            server.guild.members.map(member =>
                member
                    .removeRoles(roles_to_remove)
                    .then(member =>
                        roles_to_remove.forEach(role =>
                            log(ROLE_REMOVE)(member, role)
                        )
                    )
            )
        ).then(members => resolve(members));
    });
};

const lecture = {};
// TODO Init lectures embed
const init_overviewChannel = () => {
    // Barebone lectures embed
    lecture.embed = {
        title: `***Vorlesungsübersicht***`,
        description: "*** WIP ***",
        id: undefined
    };
    // Check if there is already a roles embed in overview channel
    find_embed(server.overviewChannel, roles.embed.title)
        .then(id => {
            log(GENERAL)(`ROLES.EMBED FOUND - ID: ${id}`);
            roles.embed.id = id;
        })
        .catch(() =>
            server.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: roles.embed.title,
                        description: roles.embed.description
                    })
                )
                .then(msg => {
                    log(GENERAL)(`ROLES.EMBED SENT - ID: ${msg.id}`);
                    log(SEND_MESSAGE)(msg);
                    roles.embed.id = msg.id;
                })
                .catch(log(ERROR))
        )
        .finally(() => {
            // React with emotes so users can just click on them
            server.overviewChannel
                // NOTE we assume there are only 5 messages in overview channel!
                .fetchMessages({ limit: 5 })
                .then(messages => {
                    let embed = messages.get(roles.embed.id);
                    roles.reactionRoles.forEach(item => {
                        embed.react(item.emoji).catch(console.error);
                    });
                })
                .catch(console.error);
        });
    // Check if there is already a lecture embed in overview channel
    find_embed(server.overviewChannel, lecture.embed.title)
        .then(id => {
            log(GENERAL)(`LECTURES.EMBED FOUND - ID: ${id}`);
            lecture.embed.id = id;
        })
        .catch(() =>
            server.overviewChannel
                .send(
                    new discord.RichEmbed({
                        title: lecture.embed.title,
                        description: lecture.embed.description
                    })
                )
                .then(msg => {
                    log(GENERAL)(`LECTURES.EMBED SENT - ID: ${msg.id}`);
                    log(SEND_MESSAGE)(msg);
                    lecture.embed.id = msg.id;
                })
                .catch(console.error)
        );
};

// Resolve id of message when found else reject
const find_embed = async (channel, title) => {
    // NOTE we assume there are only 5 messages in overview channel!
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
};

log(GENERAL)("Logging in...");
client.login(token).catch(console.error);

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
