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

client.on("guildMemberAdd", member => {
    if (member.guild.id === test.guild.id) {
        let greeting =
            `Willkommen <@` + member.id + `> auf ${test.guild.name}.\n`;
        greeting +=
            `Es wäre cool, wenn du dir die <#` +
            test.rulesChannel.id +
            `> ansiehst, bevor du dich hier umschaust :slight_smile:\n`;
        greeting +=
            `Außerdem verwalte ich hier auf dem Server die Rollen für die einzelnen Vorlesungen. Diese kannst du dir in <#` +
            test.overviewChannel.id +
            `> ansehen. Sag mir dort am besten gleich, welche Vorlesungen du besuchst, damit ich dir die jeweiligen Kanäle freischalten kann! `;
        test.defaultChannel
            .send(greeting)
            .then(msg => log_msg(msg))
            .catch(console.error);
    }
});
client.on("message", msg => {
    if (msg.content === "!newmember") {
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
    let emojis = {
        data: [],
        concat: ""
    };
    // Get names and ids of emojis
    test.guild.emojis.array().forEach(emoji => {
        emojis.data.push(
            (({ name, id }) => ({
                name,
                id
            }))(emoji)
        );
    });
    // Create a "emoji" string for usage in rolesEmbed
    emojis.data.forEach((data, index) => {
        if (index < emojis.data.length - 1)
            emojis.concat += `<:${data.name}:${data.id}>, `;
        else emojis.concat += `& <:${data.name}:${data.id}>`;
    });
    // Barebone roles embed
    // NOTE Change content to description since it is used in embed as description?
    let roles = {
        msg: {
            content: `***Rollen***\nHier könnt ihr mit den Emojis (${
                emojis.concat
            }) ... **WORK IN PROGRESS**`,
            id: undefined
        }
    };
    // Check if there is already a roles embed in overview channel
    find_embed(test.overviewChannel, roles.msg.content)
        .then(id => (roles.msg.id = id))
        .catch(() =>
            test.overviewChannel
                .send(new discord.RichEmbed({ description: roles.msg.content }))
                .then(msg => (roles.msg.id = msg.id))
                .catch(console.error)
        );
    // Barebone lectures embed
    let lecturesOverview = {
        msg: { content: `***Vorlesungsübersicht***`, id: undefined }
    };
    // Check if there is already a lecture embed in overview channel
    find_embed(test.overviewChannel, lecturesOverview.msg.content)
        .then(id => (lecturesOverview.msg.id = id))
        .catch(() => {
            test.overviewChannel
                .send(
                    new discord.RichEmbed({
                        description: lecturesOverview.msg.content
                    })
                )
                .then(msg => (lecturesOverview.msg.id = msg.id))
                .catch(console.error);
        });
};

// Resolve id of message when found else reject
async function find_embed(channel, content) {
    return channel.fetchMessages({ limit: 5 }).then(messages => {
        return new Promise(function(resolve, reject) {
            messages.array().forEach(msg => {
                if (
                    msg.embeds.some(embed => {
                        return embed.description === content;
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

console.log("Logging in...");
client.login(token).catch(reason => {
    console.error(reason);
});

process.on("SIGINT", () => {
    client.destroy().then(() => process.exit(0));
});
