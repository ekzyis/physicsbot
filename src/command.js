import { log, TYPE } from "./util";
import { FETCH_LIMIT } from "./server";

const { ERROR, WARNING, GENERAL } = TYPE;

const COMMAND_RESET_ROLES = "!resetroles";
const COMMAND_TEST_MEMBER_ADD = "!newmember";
const COMMAND_CLEAR_DEV_CHANNEL = "!cleardev";
const COMMAND_UPDATE_ROLES_EMBED = "!updaterolesembed";
export const COMMANDS = [
  COMMAND_RESET_ROLES,
  COMMAND_TEST_MEMBER_ADD,
  COMMAND_CLEAR_DEV_CHANNEL,
  COMMAND_UPDATE_ROLES_EMBED
];

export const commandHandler = server => msg => {
  let cmd = msg.content;
  switch (cmd) {
    case COMMAND_RESET_ROLES:
      command_resetRoles(server)(msg);
      break;
    case COMMAND_TEST_MEMBER_ADD:
      command_guildMemberAdd(server)(msg);
      break;
    case COMMAND_CLEAR_DEV_CHANNEL:
      command_clearDevChannel(server)(msg);
      break;
    case COMMAND_UPDATE_ROLES_EMBED:
      command_updateRolesEmbed(server)(msg);
    default:
      log(ERROR)(`commandHandler called but no valid command found!`);
  }
};

const command_resetRoles = server => msg => {
  let guildMember = server.guild.member(msg.author);
  if (guildMember.hasPermission("MANAGE_ROLES")) {
    server.resetRoles().then(({ members, removed_roles }) => {
      msg
        .reply(
          `**Folgende Rollen zurückgesetzt**:\n` +
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

const command_guildMemberAdd = server => msg => {
  let guildMember = server.guild.member(msg.author);
  return server.emit("guildMemberAdd", guildMember);
};

const command_clearDevChannel = server => async msg => {
  if (process.env.NODE_ENV !== "development")
    return log(WARNING)(
      "Clearing dev channel is only available in development mode!"
    );
  let deleted;
  do {
    deleted = await server.devChannel
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
    log(GENERAL)(`Deleted ${deleted} messages in dev channel.`);
  } while (deleted > 0);
};
