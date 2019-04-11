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
import {
  guildMemberAdd,
  messageReactionAdd,
  messageReactionRemove,
  message
} from "./event";

// prettier-ignore
const { GENERAL, ERROR } = TYPE;
const client = new discord.Client();
const token = JSON.parse(fs.readFileSync("exclude/bot.json", "utf8")).token;

client.on("guildMemberAdd", member => guildMemberAdd(server, member));

client.on("message", msg => message(msg,server.guild,client,server.overviewChannel,roles.embed,roles.mapper));

// TODO refactor since this is 99% the same as in "messageReactionRemove"
client.on("messageReactionAdd", (reaction, user) =>
  messageReactionAdd(server, roles.embed, roles.mapper, reaction, user)
);

client.on("messageReactionRemove", (reaction, user) =>
  messageReactionRemove(server, roles.embed, roles.mapper, reaction, user)
);

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

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(token).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
