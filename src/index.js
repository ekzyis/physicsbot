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
import { ANA2_UPDATE, PEP2_UPDATE, PTP2_UPDATE } from "./scrape";
import { connect } from "./db";

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
});

client.once("ready", () => {
  const bot = new BotClient(client);
  bot.on("message", messageHandler);
  bot.on("messageReactionAdd", messageReactionAddHandler);
  bot.on("messageReactionRemove", messageReactionRemoveHandler);
  bot.on("guildMemberAdd", guildMemberAddHandler);
  bot.initEmbeds();
  // connect to database
  bot.connect(
    `mongodb://localhost/physicsbot_${process.env.NODE_ENV.slice(0, 3)}`
  );
  bot.initDB();
  // NOTE this will retrigger without caring if previous update is finished!
  //bot.interval(PTP2_UPDATE, 2500 * 60);
  //bot.interval(PEP2_UPDATE, 2500 * 60);
  //bot.interval(ANA2_UPDATE, 2500 * 60);
});

client.on("error", log(ERROR));

log(GENERAL)("Logging in...");
client.login(process.env.TOKEN).catch(log(ERROR));

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});
