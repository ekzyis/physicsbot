/* istanbul ignore file */
import createLogger from "logging";
export const startupLogger = createLogger("STARTUP");
export const botLogger = createLogger("BOT");
export const dbLogger = createLogger("DB");
export const scrapeLogger = createLogger("SCRAPE");

export const TYPE = {
  REACTION_ADD: (user, reaction) =>
    `REACTION_ADD: ${user.tag}, ${reaction.emoji.name}, ${reaction.message.id}`,
  REACTION_REMOVE: (user, reaction) =>
    `REACTION_REMOVE: ${user.tag}, ${reaction.emoji.name}, ${
      reaction.message.id
    }`,
  ROLE_ADD: (member, role) => `ROLE_ADD: ${member.user.tag}, ${role.name}`,
  ROLE_REMOVE: (member, role) =>
    `ROLE_REMOVE: ${member.user.tag}, ${role.name}`,
  SEND_MESSAGE: msg =>
    `SEND_MSG: ${msg.guild.name}@${msg.channel.name}: ${msg.content}`,
  DELETE_MESSAGE: msg =>
    `DELETE_MSG: ${msg.guild.name}@${msg.channel.name}: ${msg.content}`,
  EDIT: msg => `EDIT_MSG: ${msg.guild.name}@${msg.channel.name}: ${msg.content}`
};

export const log = type => (...a) => {
  if (!process.env.TEST) return `${type(...a)}`;
};
