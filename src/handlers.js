import { log, TYPE } from "./util";
import { commandHandler, COMMANDS } from "./command";
const {
  REACTION_ADD,
  REACTION_REMOVE,
  ROLE_ADD,
  ROLE_REMOVE,
  SEND_MESSAGE,
  ERROR
} = TYPE;

export const guildMemberAddHandler = server => member => {
  if (member.guild.id === server.guild.id) {
    let embedGreeting = {
      // NOTE https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      // Discord says you can use a discord.RichEmbed but they use its object syntax
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
};

const messageReactionComposer = (LOG_REACTION, LOG_ROLE, roleFn) => server => (
  reaction,
  user
) => {
  if (user.bot) return;
  if (reaction.message.id === server.embeds.role.id) {
    log(LOG_REACTION)(user, reaction);
    let associatedItem = Array.from(server.roleNameMap.values()).find(
      item => item.emoji.id === reaction.emoji.id
    );
    if (associatedItem) {
      // Reaction is included in a role item and therefore does have a associated role
      let associatedRole = associatedItem.role;
      server.guild
        .fetchMember(user)
        .then(member =>
          roleFn(member, associatedRole.id)
            .then(member => {
              log(LOG_ROLE)(member, associatedRole);
            })
            .catch(log(ERROR))
        )
        .catch(log(ERROR));
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

export const messageHandler = server => msg => {
  if (!msg.guild) return;
  if (msg.guild.id === server.guild.id) {
    if (COMMANDS.includes(msg.content)) {
      commandHandler(server)(msg);
    }
  }
};
