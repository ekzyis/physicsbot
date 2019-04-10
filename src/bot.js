#!/usr/bin/node
import "@babel/polyfill";

import { log, TYPE } from "./util";
import discord from "discord.js";
import fs from "fs";
import {
  getLectures,
  getRoles,
  getServer,
  init_overviewChannel
} from "./guild";

// prettier-ignore
const { GENERAL, REACTION_ADD, REACTION_REMOVE, ROLE_ADD, ROLE_REMOVE, SEND_MESSAGE, DELETE_MESSAGE, ERROR } = TYPE;
const client = new discord.Client();
const token = JSON.parse(fs.readFileSync("exclude/bot.json", "utf8")).token;

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

let server = {};
let roles = {};
let lectures = {};
client.on("ready", () => {
  log(GENERAL)(
    `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
  );
  client.user
    .setActivity("LHC live stream", { type: "WATCHING" })
    .catch(log(ERROR));
  server = getServer(client);
  roles = getRoles(server);
  getLectures(roles.mapper).then(result => {
    lectures = result;
    return init_overviewChannel(
      server.overviewChannel,
      roles.embed,
      roles.mapper,
      lectures
    );
  });
});

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

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(token).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
