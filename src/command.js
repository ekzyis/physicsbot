import { log, TYPE } from "./util";
import { clearChannel } from "./guild";
const { ERROR, WARNING, GENERAL, SEND_MESSAGE, ROLE_ADD } = TYPE;

export const COMMAND_RESET_ROLES = "!resetroles";
const COMMAND_RESET_ROLES_EMBED = "!resetrolesembed";
const COMMAND_TEST_MEMBER_ADD = "!newmember";
export const COMMAND_CLEAR_CHANNEL = "!clearchannel";
const COMMAND_ADD_RANDOM_ROLES = "!addrandomroles";
const COMMAND_STATUS = "!status";
export const COMMANDS = [
  COMMAND_RESET_ROLES,
  COMMAND_RESET_ROLES_EMBED,
  COMMAND_TEST_MEMBER_ADD,
  COMMAND_CLEAR_CHANNEL,
  COMMAND_ADD_RANDOM_ROLES,
  COMMAND_STATUS
];

export const commandHandler = bot => msg => {
  let cmd = msg.content;
  switch (cmd) {
    case COMMAND_RESET_ROLES:
      return command_resetRoles(bot)(msg);
    case COMMAND_TEST_MEMBER_ADD:
      return command_guildMemberAdd(bot)(msg);
    case COMMAND_CLEAR_CHANNEL:
      return command_clearChannel(bot)(msg);
    case COMMAND_RESET_ROLES_EMBED:
      return command_resetRolesEmbed(bot)(msg);
    case COMMAND_ADD_RANDOM_ROLES:
      return command_addRandomRoles(bot)(msg);
    case COMMAND_STATUS:
      return command_status(bot)(msg);
    default:
      log(WARNING)(`commandHandler called but no valid command found!`);
  }
};

const command_status = bot => msg => {
  msg
    .reply(bot.status())
    .then(log(SEND_MESSAGE))
    .catch(msg =>
      log(ERROR)(
        `Error sending reply for command ${COMMAND_RESET_ROLES}. Reason: ${msg}`
      )
    );
};

const command_resetRoles = bot => msg => {
  let guildMember = bot.guild.member(msg.author);
  if (guildMember.hasPermission("MANAGE_ROLES")) {
    return bot
      .resetRoles()
      .then(
        ({ members, removed_roles }) =>
          msg
            .reply(
              `**Folgende Rollen für ${
                members.length
              } User zurückgesetzt**:\n` +
                `${removed_roles.map(role => role + "\n").join("")}`
            )
            .then(msg => {
              log(SEND_MESSAGE)(msg);
              log(GENERAL)("Roles have been successfully reset");
            })
            .catch(msg =>
              log(ERROR)(
                `Error sending reply for command ${COMMAND_RESET_ROLES}. Reason: ${msg}`
              )
            ),
        err => log(ERROR)(`Error while resetting roles. Reason: ${err}`)
      )
      .catch(log(ERROR));
  } else {
    return msg
      .reply("Keine ausreichenden Rechte.")
      .then(log(SEND_MESSAGE))
      .catch(log(ERROR));
  }
};

const command_resetRolesEmbed = bot => msg => {
  let guildMember = bot.guild.member(msg.author);
  if (guildMember.hasPermission("MANAGE_ROLES")) {
    return bot
      .resetRolesEmbed()
      .then(
        () => msg.reply(`**Rollenübersicht erfolgreich zurückgesetzt!`),
        err => log(ERROR)(`Error while resetting roles embed. Reason: ${err}`)
      )
      .catch(msg => {
        log(ERROR)(
          `Error sending reply for command ${COMMAND_RESET_ROLES_EMBED}. Reason: ${msg}`
        );
      })
      .then(msg => {
        log(SEND_MESSAGE)(msg);
        log(GENERAL)("Roles embed has been successfully reset");
      });
  }
};

const command_guildMemberAdd = bot => msg => {
  let guildMember = bot.guild.member(msg.author);
  return bot.emit("guildMemberAdd", guildMember);
};

const command_clearChannel = bot => msg => {
  if (process.env.NODE_ENV !== "development") {
    const ERROR_MESSAGE =
      "Clearing a channel is only available in development mode!";
    log(WARNING)(ERROR_MESSAGE);
    return Promise.reject(ERROR_MESSAGE);
  }
  let guildMember = bot.guild.member(msg.author);
  if (!guildMember.hasPermission("MANAGE_GUILD")) {
    const ERROR_MESSAGE = "Not enough permissions to clear channel!";
    log(WARNING)(ERROR_MESSAGE);
    return Promise.reject(ERROR_MESSAGE);
  }
  return clearChannel(msg.channel);
};

const command_addRandomRoles = bot => async msg => {
  try {
    log(GENERAL)(`Adding roles randomly to users in guild...`);
    let available_roles = Array.from(bot.roleNameMap.values()).map(i => i.role);
    const CHANCE_TO_GET_ROLE = 3 / (4 * available_roles.length);
    // TODO Damn, this code is ugly. Add proper documentation and/or refactor!
    // The purpose of this code is to synchronously add roles to prevent warning
    // "MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
    //    11 guildMemberUpdate listeners added. Use emitter.setMaxListeners() to increase limit"
    const addFunctions = bot.guild.members
      .map(m => {
        return available_roles.map(r => () => {
          let random = Math.random();
          if (random <= CHANCE_TO_GET_ROLE && m.user.id !== bot.id)
            return m
              .addRole(r)
              .then(member => {
                log(ROLE_ADD)(member, r);
              })
              .catch(log(ERROR));
          return null;
        });
      })
      .flat();
    for (let addFn of addFunctions) {
      await addFn();
    }
    return msg
      .reply(`Rollen erfolgreich zufällig verteilt!`)
      .then(msg => {
        log(SEND_MESSAGE)(msg);
        log(GENERAL)(`Roles have been successfully randomly added.`);
      })
      .catch(err =>
        log(ERROR)(
          `Error sending reply for command ${COMMAND_ADD_RANDOM_ROLES}. Reason: ${err}`
        )
      );
  } catch (err) {
    log(ERROR)(err);
  }
};
