import { botLogger, log, TYPE } from "./util";
import { commandHandler, COMMANDS } from "./command";
const {
  REACTION_ADD,
  REACTION_REMOVE,
  ROLE_ADD,
  ROLE_REMOVE,
  SEND_MESSAGE
} = TYPE;

export const GREETING_EMBED_TITLE = (bot, member) =>
  `Willkommen ${member.user.tag} auf ${bot.guild.name}!\n`;
export const guildMemberAddHandler = bot => member => {
  if (member.guild.id === bot.guild.id) {
    let embedGreeting = {
      // NOTE https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      // Discord says you can use a discord.RichEmbed but they use its object syntax
      embed: {
        thumbnail: {
          url: member.user.avatarURL
        },
        title: GREETING_EMBED_TITLE(bot, member),
        description:
          `Es wäre cool, wenn du dir die ` +
          bot.rulesChannel +
          ` ansiehst, bevor du dich hier umschaust :slight_smile:\n` +
          `Außerdem verwalte ich hier auf dem Server die Rollen für die einzelnen Vorlesungen. Diese kannst du dir in ` +
          bot.overviewChannel +
          ` ansehen. Sag mir dort am besten gleich, welche Vorlesungen du besuchst, damit ich dir die jeweiligen Kanäle freischalten kann!`
      }
    };
    return bot.defaultChannel
      .send(member.toString(), embedGreeting)
      .then(msg => botLogger.info(log(SEND_MESSAGE)(msg)))
      .catch(botLogger.error);
  }
};

const messageReactionComposer = (LOG_REACTION, LOG_ROLE, roleFn) => bot => (
  reaction,
  user
) => {
  if (user.bot) return;
  if (reaction.message.id === bot.embeds.role.message.id) {
    botLogger.info(log(LOG_REACTION)(user, reaction));
    let associatedItem = Array.from(bot.roleNameMap.values()).find(
      item => item.emoji.id === reaction.emoji.id
    );
    if (associatedItem) {
      // Reaction is included in a role item and therefore does have a associated role
      let associatedRole = associatedItem.role;
      return bot.guild
        .fetchMember(user)
        .then(member =>
          roleFn(member, associatedRole.id)
            .then(member => {
              botLogger.info(log(LOG_ROLE)(member, associatedRole));
            })
            .catch(botLogger.error)
        )
        .catch(botLogger.error);
    }
  }
};

export const messageReactionAddHandler = messageReactionComposer(
  REACTION_ADD,
  ROLE_ADD,
  (member, roleId) => member.addRole(roleId)
);

export const messageReactionRemoveHandler = messageReactionComposer(
  REACTION_REMOVE,
  ROLE_REMOVE,
  (member, roleId) => member.removeRole(roleId)
);

export const messageHandler = bot => msg => {
  if (!msg.guild) return;
  if (msg.guild.id === bot.guild.id) {
    if (COMMANDS.includes(msg.content)) {
      commandHandler(bot)(msg);
    }
  }
};
