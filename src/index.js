#!/usr/bin/node
import "@babel/polyfill";

import { log, TYPE } from "./util";
import discord from "discord.js";
import {
  guildMemberAddHandler,
  messageReactionAddHandler,
  messageReactionRemoveHandler,
  messageHandler
} from "./handlers";
import { Server } from "./server";

// prettier-ignore
const { GENERAL, ERROR } = TYPE;
const client = new discord.Client();

client.on("ready", () => {
  log(GENERAL)(
    `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
  );
  client.user
    .setActivity("LHC live stream", { type: "WATCHING" })
    .catch(log(ERROR));
  const server = new Server(client);
  server.on("message", messageHandler);
  server.on("messageReactionAdd", messageReactionAddHandler);
  server.on("messageReactionRemove", messageReactionRemoveHandler);
  server.on("guildMemberAdd", guildMemberAddHandler);
  server.initEmbeds();
});

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(process.env.TOKEN).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
