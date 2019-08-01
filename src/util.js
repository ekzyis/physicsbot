/* istanbul ignore file */

const TYPE = {
  GENERAL: msg => `[ INFO ]:[ ${msg} ]`,
  REACTION_ADD: (user, reaction) =>
    `[ REACTION_ADD ]:[ ${user.tag}, ${reaction.emoji.name}, ${
      reaction.message.id
    } ]`,
  REACTION_REMOVE: (user, reaction) =>
    `[ REACTION_REMOVE ]:[ ${user.tag}, ${reaction.emoji.name}, ${
      reaction.message.id
    } ]`,
  ROLE_ADD: (member, role) =>
    `[ ROLE_ADD ]:[ ${member.user.tag}, ${role.name} ]`,
  ROLE_REMOVE: (member, role) =>
    `[ ROLE_REMOVE ]:[ ${member.user.tag}, ${role.name} ]`,
  SEND_MESSAGE: msg =>
    `[ SEND_MSG ]:[ ${msg.guild.name}@${msg.channel.name}: ${msg.content} ]`,
  DELETE_MESSAGE: msg =>
    `[ DELETE_MSG ]:[ ${msg.guild.name}@${msg.channel.name}: ${msg.content} ]`,
  EDIT: msg =>
    `[ EDIT_MSG ]:[ ${msg.guild.name}@${msg.channel.name}: ${msg.content} ]`,
  ERROR: e => `[ ERROR ]:[ ${e.message || e} ]`,
  WARNING: msg => `[ WARNING ]:[ ${msg} ]`,
  DB: msg => `[ DB ]:[ ${msg} ]`
};

const log = type => (...a) => {
  if (!process.env.TEST) console.log(`[ ${timestamp()} ]${type(...a)}`);
};

const timestamp = () => {
  let date = new Date();
  let format = time => {
    return time < 10 ? `0${time}` : time;
  };
  let hrs = format(date.getHours());
  let min = format(date.getMinutes());
  let sec = format(date.getSeconds());
  let day = format(date.getDate());
  let mon = format(date.getMonth() + 1);
  let year = date.getFullYear();
  return `${day}/${mon}/${year}T${hrs}:${min}:${sec}`;
};

module.exports = {
  log,
  TYPE
};
