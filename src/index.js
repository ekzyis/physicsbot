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
import { BotClient } from "./botClient";
import { PEP2_UPDATE, PTP2_UPDATE } from "./scrape";

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
  const bot = new BotClient(client);
  bot.on("message", messageHandler);
  bot.on("messageReactionAdd", messageReactionAddHandler);
  bot.on("messageReactionRemove", messageReactionRemoveHandler);
  bot.on("guildMemberAdd", guildMemberAddHandler);
  bot.initEmbeds();
  // NOTE this will retrigger without caring if previous update is finished!
  bot.interval(PTP2_UPDATE, 5000 * 60);
  bot.interval(PEP2_UPDATE, 20000);
});

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(process.env.TOKEN).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
