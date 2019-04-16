import { log, TYPE } from "./util";
import discord from "discord.js";

const { GENERAL } = TYPE;

export const genServerInstance = (config, client) => {
  let instance = {};
  instance.guild = client.guilds.get(config.guild.id);
  instance.defaultChannel = instance.guild.channels.get(
    config.channel.default.id
  );
  instance.rulesChannel = instance.guild.channels.get(config.channel.rules.id);
  instance.overviewChannel = instance.guild.channels.get(
    config.channel.overview.id
  );
  if (process.env.NODE_ENV === "development")
    instance.devChannel = instance.guild.channels.get(config.channel.dev.id);
  return instance;
};

export const genRoleNameMap = (config, guild) => {
  let map = new Map();
  config.roles.forEach(item => {
    if (item.emoji) {
      let value = {
        role: guild.roles.get(item.role.id),
        emoji: guild.emojis.get(item.emoji.id)
      };
      if (!!item.channel) {
        value.channel = guild.channels.get(item.channel.id);
      }
      map.set(item.name, value);
      log(GENERAL)(
        `role name: ${item.name}, role id: ${item.role.id}, emoji id: ${
          item.emoji.id
        } ${!!item.channel ? `, channel id: ${item.channel.id}` : ""}`
      );
    }
  });
  return map;
};

export const ROLE_EMBED_TITLE = "***Rollen***";
export const genRoleEmbed = (defaultChannel, roleNameMap) => {
  let emojiRows = "";
  roleNameMap.forEach(v => {
    emojiRows += `${v.role.toString()}: ${v.emoji.toString()}\n\n`;
  });
  let embed = new discord.RichEmbed();
  embed.setTitle(ROLE_EMBED_TITLE);
  let description =
    `\nWillkommen im Rollen-Verteiler, hier könnt ihr auswählen was ihr studiert ` +
    `und welche Kurse ihr belegt in dem ihr entsprechend auf diese Nachricht *reagiert*.\n\n` +
    `Das ganze dient zur Übersicht und schaltet nur für die einzelnen Kurse bestimmte Text[- und Sprach]kanäle ` +
    `frei, die ihr jetzt noch nicht sehen könnt.\n\n` +
    `Reagieren ist ganz einfach: Klickt einfach auf die einzelnen Symbole unter diesem Post. ` +
    `Dadurch erscheinen neue Textkanäle, in denen du dich mit deinen Kommilitonen austauschen kannst.\n` +
    `Dies ist auch reversibel. Ihr könnt hier auch eine Reaktion durch einfaches Klicken wieder entfernen, ` +
    `um z.B. über LA oder ANA nicht mehr informiert zu werden, bzw. diese Kanäle nicht mehr zu sehen.\n\n` +
    `Probiert es ruhig aus, ihr könnt nichts falsch machen, nichts ist in Stein gemeißelt. Bei Fragen sind alle im Kanal ` +
    defaultChannel +
    ` sehr hilfsbereit!\n\n` +
    `${emojiRows}`;
  embed.setDescription(description);
  return embed;
};
