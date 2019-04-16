import { log, TYPE } from "./util";
import { FETCH_LIMIT } from "./botClient";

const { ERROR, WARNING, GENERAL, SEND_MESSAGE } = TYPE;

const COMMAND_RESET_ROLES = "!resetroles";
const COMMAND_TEST_MEMBER_ADD = "!newmember";
const COMMAND_CLEAR_DEV_CHANNEL = "!cleardev";
export const COMMANDS = [
  COMMAND_RESET_ROLES,
  COMMAND_TEST_MEMBER_ADD,
  COMMAND_CLEAR_DEV_CHANNEL
];

export const commandHandler = bot => msg => {
  let cmd = msg.content;
  switch (cmd) {
    case COMMAND_RESET_ROLES:
      command_resetRoles(bot)(msg);
      break;
    case COMMAND_TEST_MEMBER_ADD:
      command_guildMemberAdd(bot)(msg);
      break;
    case COMMAND_CLEAR_DEV_CHANNEL:
      command_clearDevChannel(bot)(msg);
      break;
    default:
      log(ERROR)(`commandHandler called but no valid command found!`);
  }
};

const command_resetRoles = bot => msg => {
  let guildMember = bot.guild.member(msg.author);
  if (guildMember.hasPermission("MANAGE_ROLES")) {
    bot.resetRoles().then(({ members, removed_roles }) => {
      msg
        .reply(
          `**Folgende Rollen für ${members.length} User zurückgesetzt**:\n` +
            `${removed_roles.map(role => role + "\n").join("")}`
        )
        .then(msg => {
          log(SEND_MESSAGE)(msg);
          log(GENERAL)("Roles have been successfully reset");
        })
        .catch(msg =>
          log(ERROR)(
            `Error sending reply for command !resetroles. Reason: ${msg}`
          )
        );
    });
  } else {
    msg.reply("Keine ausreichenden Rechte.").then(log(SEND_MESSAGE));
  }
};

const command_guildMemberAdd = bot => msg => {
  let guildMember = bot.guild.member(msg.author);
  return bot.emit("guildMemberAdd", guildMember);
};

const command_clearDevChannel = bot => async msg => {
  if (process.env.NODE_ENV !== "development")
    return log(WARNING)(
      "Clearing dev channel is only available in development mode!"
    );
  let deleted;
  do {
    deleted = await bot.devChannel
      .fetchMessages({ limit: FETCH_LIMIT })
      .then(messages => {
        return Promise.all(messages.map(m => m.delete())).then(
          msgs => msgs.length
        );
      })
      .catch(err => {
        log(ERROR)(err);
        return -1;
      });
    if (deleted > 0)
      log(GENERAL)(`Deleted ${deleted} messages in dev channel.`);
  } while (deleted > 0);
};