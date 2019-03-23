#!/usr/bin/node
import "@babel/polyfill";

import { log, TYPE } from "./util";
// prettier-ignore
import { getLineareAlgebraData, getAnalysisData, getExpData, getTheoData } from "./scrape";
import discord from "discord.js";
import fs from "fs";

// prettier-ignore
const { GENERAL, REACTION_ADD, REACTION_REMOVE, ROLE_ADD, ROLE_REMOVE, SEND_MESSAGE, DELETE_MESSAGE, EDIT, ERROR } = TYPE;
const client = new discord.Client();
const token = JSON.parse(fs.readFileSync("exclude/bot.json", "utf8")).token;
const serverData = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));

const FETCH_LIMIT = 10;

client.on("guildMemberAdd", member => {
  if (member.guild.id === server.guild.id) {
    let embedGreeting = {
      embed: {
        thumbnail: {
          url: member.user.avatarURL
        },
        title: `Willkommen ${member.user.tag} auf ${server.guild.name}!\n`,
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
          msg
            .reply(
              `**Folgende Rollen zurückgesetzt**:\n` +
                `${reset_roles.map(role => role.toString() + "\n").join("")}`
            )
            .then(msg => {
              log(SEND_MESSAGE)(msg);
              log(GENERAL)("Roles have been successfully reset");
            })
            .catch(msg =>
              log(ERROR)("Error sending reply for command !resetroles.")
            );
        });
      } else {
        msg.reply("Keine ausreichenden Rechte.").then(log(SEND_MESSAGE));
      }
    }
  }
});

// TODO refactor since this is 99% the same as in "messageReactionRemove"
client.on("messageReactionAdd", (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id === roles.embed.id) {
    log(REACTION_ADD)(user, reaction);
    let associatedItem = Array.from(roles.mapper.values()).find(
      item => item.emoji.id === reaction.emoji.id
    );
    if (associatedItem) {
      // Reaction is included in an role item and therefore does have a associated role
      let associatedRole = associatedItem.role;
      server.guild
        .fetchMember(user)
        .then(member =>
          member
            .addRole(associatedRole.id)
            .then(member => {
              log(ROLE_ADD)(member, associatedRole);
            })
            .catch(log(ERROR))
        )
        .catch(log(ERROR));
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id === roles.embed.id) {
    log(REACTION_REMOVE)(user, reaction);
    let associatedItem = Array.from(roles.mapper.values()).find(
      item => item.emoji.id === reaction.emoji.id
    );
    if (associatedItem) {
      // Reaction is included in an item in list and therefore does have a associated role
      let associatedRole = associatedItem.role;
      server.guild
        .fetchMember(user)
        .then(member =>
          member
            .removeRole(associatedRole.id)
            .then(member => {
              log(ROLE_REMOVE)(member, associatedRole);
            })
            .catch(log(ERROR))
        )
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
    .catch(log(ERROR));
  init_server();
  init_roles();
  init_lectures().then(init_overviewChannel);
});

let server = {};
const init_server = () => {
  let KEY = process.env.NODE_ENV;
  server = serverData[KEY];
  server.guild = client.guilds.get(server.id);
  server.defaultChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "default").id
  );
  server.rulesChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "rules").id
  );
  server.overviewChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "overview").id
  );
};

const roles = {};
const init_roles = () => {
  roles.mapper = new Map();
  // populate mapper with given role and emoji IDs and if exists, channel
  server.roles.forEach(item => {
    if (item.emoji) {
      // NOTE we assume that every item with props emoji also has props role
      let value = {
        role: server.guild.roles.get(item.role.id),
        emoji: server.guild.emojis.get(item.emoji.id)
      };
      if (!!item.channel) {
        value.channel = server.guild.channels.get(item.channel.id);
      }
      roles.mapper.set(item.name, value);
      log(GENERAL)(
        `role name: ${item.name}, role id: ${item.role.id}, emoji id: ${
          item.emoji.id
        }, channel id: ${!!item.channel ? item.channel.id : undefined}`
      );
    }
  });
  let emojiString = "";
  roles.mapper.forEach(value => {
    emojiString += `${value.role.toString()}: ${value.emoji.toString()}\n\n`;
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

const lectures = {
  algebra: {},
  analysis: {},
  exp: {},
  theo: {}
};
const init_lectures = async () => {
  // Lineare Algebra embed
  lectures.algebra.name = "Lineare Algebra";
  lectures.algebra.fields = await getLineareAlgebraData();
  lectures.algebra.updater = getLineareAlgebraData;
  lectures.algebra.embed = {
    title: `${
      roles.mapper.get("Lineare Algebra").emoji
    }  ***Vorlesungsübersicht für Lineare Algebra***`,
    fields: lectures.algebra.fields,
    color: 0x1be0ec,
    id: undefined
  };
  // Analysis embed
  lectures.analysis.name = "Analysis";
  lectures.analysis.fields = await getAnalysisData();
  lectures.analysis.updater = getAnalysisData;
  lectures.analysis.embed = {
    title: `${
      roles.mapper.get("Analysis").emoji
    }  ***Vorlesungsübersicht für Analysis***`,
    fields: lectures.analysis.fields,
    color: 0xcfdb15,
    id: undefined
  };
  // Experimentalphysik embed
  lectures.exp.name = "Experimentalphysik";
  lectures.exp.fields = await getExpData();
  lectures.exp.updater = getExpData;
  lectures.exp.embed = {
    title: `${
      roles.mapper.get("Experimentalphysik").emoji
    }  ***Vorlesungsübersicht für Experimentalphysik I***`,
    fields: lectures.exp.fields,
    color: 0xf31be6,
    id: undefined
  };
  // Theoretische Physik embed
  lectures.theo.name = "Theoretische Physik";
  lectures.theo.fields = await getTheoData();
  lectures.theo.updater = getTheoData;
  lectures.theo.embed = {
    title: `${
      roles.mapper.get("Theoretische Physik").emoji
    }  ***Vorlesungsübersicht für Theoretische Physik I***`,
    fields: lectures.theo.fields,
    color: 0x2be07c,
    id: undefined
  };
};

const reset_roles_embed = () => {
  // TODO Shouldn't the promise be rejected in the catch's?
  return new Promise(resolve => {
    server.overviewChannel
      .fetchMessage(roles.embed.id)
      .then(embed => {
        embed.delete().then(msg => {
          log(DELETE_MESSAGE)(msg);
          let roles_to_remove = Array.from(roles.mapper.values()).map(
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
                  roles.embed.id = msg.id;
                  Array.from(roles.mapper.values()).forEach(item => {
                    msg.react(item.emoji).catch(log(ERROR));
                  });
                  log(SEND_MESSAGE)(msg);
                  log(GENERAL)(`Successfully sent roles.embed - id: ${msg.id}`);
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
        "Resetting role " + role.name + " with id " + role.id + " ..."
      )
    );
    Promise.all(
      server.guild.members.map(member =>
        member
          .removeRoles(roles_to_remove)
          .then(member =>
            roles_to_remove.forEach(role => log(ROLE_REMOVE)(member, role))
          )
      )
    ).then(members => resolve(members));
  });
};

const init_overviewChannel = () => {
  // Check if there is already a roles embed in overview channel
  init_embed(server.overviewChannel, roles.embed).finally(() => {
    // React with emotes so users can just click on them
    server.overviewChannel
      .fetchMessage(roles.embed.id)
      .then(message => {
        roles.mapper.forEach(value => {
          message.react(value.emoji).catch(log(ERROR));
        });
      })
      .catch(log(ERROR));
  });
  Promise.all(
    Object.keys(lectures).map(key =>
      init_embed(server.overviewChannel, lectures[key].embed)
    )
  ).then(
    setInterval(
      () => Object.keys(lectures).forEach(key => updateLecture(lectures[key])),
      5000 * 60 // 5 seconds * 60 = 5 minutes //
    )
  );
};

const updateLecture = async lec => {
  let newFields = await lec.updater();
  // NOTE We ignore elements which old data contains but new data not!
  let diff = newFields.filter(obj => {
    // Get elements which are not included in old data
    return !lec.fields.some(obj2 => {
      return obj.value === obj2.value;
    });
  });
  // If object is not empty, update embed
  if (!!Object.keys(diff).length) {
    log(GENERAL)(`Updated needed for ${lec.embed.title}! Editing embed...`);
    lec.fields = newFields;
    lec.embed = {
      ...lec.embed,
      fields: newFields
    };
    edit_embed(server.overviewChannel, lec.embed.id, lec.embed).then(() => {
      let channel = roles.mapper.get(lec.name).channel;
      // NOTE mentioning of roles disabled for the time being
      //let role = roles.mapper.get(lec.name).role;
      // NOTE why is channel.send(string, embed) showing warning about "params don't match"?
      // https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      channel
        .send(`${server.overviewChannel.toString()} aktualisiert mit:`, {
          embed: new discord.RichEmbed({
            ...lec.embed,
            title: `${lec.embed.title} (nur aktualisierte Links)`,
            fields: Object.values(diff)
          })
        })
        .then(log(SEND_MESSAGE))
        .catch(log(ERROR));
    });
  }
};

const edit_embed = (channel, id, updatedEmbed) => {
  return channel
    .fetchMessage(id)
    .then(fetched => {
      fetched
        .edit(
          new discord.RichEmbed({
            ...updatedEmbed
          })
        )
        .then(log(EDIT));
    })
    .catch(log(ERROR));
};

const init_embed = (channel, embed) => {
  // look if embed already exists
  return find_embed(channel, embed.title)
    .then(id => {
      log(GENERAL)(`Found embed for ${embed.title} - id: ${id}`);
      embed.id = id;
    })
    .catch(() => {
      // if not, create it
      return channel
        .send(
          new discord.RichEmbed({
            ...embed
          })
        )
        .then(msg => {
          log(GENERAL)(
            `Successfully sent embed for ${embed.title} - id: ${msg.id}`
          );
          log(SEND_MESSAGE)(msg);
          embed.id = msg.id;
        })
        .catch(log(ERROR));
    });
};

// Resolve id of message when found else reject with message "Message not found" ¯\_(ツ)_/¯
const find_embed = (channel, title) => {
  // NOTE we assume there are only FETCH_LIMIT messages in overview channel!
  return channel.fetchMessages({ limit: FETCH_LIMIT }).then(messages => {
    return new Promise(function(resolve, reject) {
      messages.array().forEach(msg => {
        if (msg.embeds.some(embed => embed.title === title)) {
          resolve(msg.id);
        }
      });
      reject("Message not found ¯\\_(ツ)_/¯");
    });
  });
};

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(token).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
