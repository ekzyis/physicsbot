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
import {
  ANA1_UPDATE,
  PEP1_UPDATE,
  PEP3_UPDATE,
  PTP1_UPDATE,
  PTP3_UPDATE
} from "./scrape/scrape";
//import  from "./util";
import { startupLogger as logger, botLogger } from "./util";
// prettier-ignore
//const { GENERAL, ERROR } = TYPE;
const client = new discord.Client();

client.on("ready", () => {
  logger.info(
    `${client.user.tag} is now logged in! Mode: ${process.env.NODE_ENV}`
  );
  client.user
    .setActivity("LHC live stream", { type: "WATCHING" })
    .catch(logger.error);
});

client.once("ready", () => {
  const bot = new BotClient(client);
  bot.on("message", messageHandler);
  bot.on("messageReactionAdd", messageReactionAddHandler);
  bot.on("messageReactionRemove", messageReactionRemoveHandler);
  bot.on("guildMemberAdd", guildMemberAddHandler);
  bot.initEmbeds();
});

client.on("error", botLogger.error);

logger.info("Logging in...");
client.login(process.env.TOKEN).catch(logger.error);

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
