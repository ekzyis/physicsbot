import fs from "fs";
import discord from "discord.js";
import { botLogger, log, TYPE } from "./util";
import { genRoleEmbed, genRoleNameMap, genServerInstance } from "./gen";
import assert from "assert";
import { connect, initDatabase } from "./db";
import YAML from "yaml";
const { SEND_MESSAGE, ROLE_REMOVE, DELETE_MESSAGE } = TYPE;

// using Symbol marks the variables as "private" since they are harder accessible
const _client = Symbol("client");
const _initEmbed = Symbol("init_embed");
const _findEmbedMessage = Symbol("find_embed_message");
const _addReactionsToRolesEmbed = Symbol("add_reactions_to_roles_embed");
export const FETCH_LIMIT = 30;

export class BotClient {
  constructor(client) {
    // NOTE we assume the client is already logged in!
    this[_client] = client;
    this.id = client.user.id;
    let config = YAML.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
      process.env.NODE_ENV
    ];
    this.config = config;
    this.creds = YAML.parse(fs.readFileSync(process.env.CREDS, "utf8"));
    let instance = genServerInstance(config, client);
    this.guild = instance.guild;
    this.defaultChannel = instance.defaultChannel;
    this.rulesChannel = instance.rulesChannel;
    this.overviewChannel = instance.overviewChannel;
    this.devChannel = instance.devChannel;
    let roleNameMap = genRoleNameMap(config, instance.guild);
    this.roleNameMap = roleNameMap;
    this.embeds = {};
    this.embeds.role = {
      channel: instance.overviewChannel,
      embed: genRoleEmbed(instance.defaultChannel, roleNameMap),
      message: undefined
    };
    this.updateIntervals = [];
  }

  status = () => {
    let embed = new discord.RichEmbed();
    embed.setTitle(`Status for bot in ${process.env.NODE_ENV} mode`);
    embed.addField("Default channel id", this.defaultChannel.id, true);
    embed.addField("Rules channel id", this.rulesChannel.id, true);
    embed.addField("Overview channel id", this.overviewChannel.id, true);
    embed.addField("Active listeners", this.updateIntervals.length, true);
    embed.addField("Running commit", process.env.COMMIT);
    return embed;
  };

  connect = url => {
    this.db = connect(url);
  };

  initDB = () => {
    return initDatabase(this);
  };

  interval = (intervalFunction, interval) => {
    let intervalResult = setInterval(
      () => intervalFunction(this)().catch(botLogger.error),
      interval
    );
    this.updateIntervals.push(intervalResult);
    return intervalResult;
  };

  on = (event, handler) => {
    this[_client].on(event, handler(this));
  };

  emit = (event, data) => {
    this[_client].emit(event, data);
  };

  // if embed alreadys exists, sets id of existing message with embed
  // else a new embed is created and this new message id is saved
  initEmbeds = () => {
    let promises = [];
    for (let key in this.embeds) {
      if (this.embeds.hasOwnProperty(key)) {
        let { channel, embed } = this.embeds[key];
        promises.push(
          this[_initEmbed](channel, embed).then(
            msg => (this.embeds[key].message = msg)
          )
        );
      }
    }
    return Promise.all(promises)
      .then(ids =>
        // Check if every embed now has a link to a message
        assert(Object.values(this.embeds).every(({ message }) => !!message.id))
      )
      .then(() => {
        // additionally, check if the roles embed has all role-emojis as reactions
        let roleEmojis = Array.from(this.roleNameMap.values()).map(
          item => item.emoji
        );
        // prettier-ignore
        if (!roleEmojis.every(emoji =>
          this.embeds.role.message.reactions.map(r => r.emoji).includes(emoji)
        )) {
          return this.updateRolesEmbed();
        }
      });
  };

  [_initEmbed] = (channel, embed) => {
    // look if embed already exists
    return this[_findEmbedMessage](channel, embed)
      .then(msg => {
        botLogger.info(`Found embed (${embed.title}) - id: ${msg.id}`);
        return msg;
      })
      .catch(err => {
        // if not, create it
        botLogger.warn(err);
        return channel
          .send(embed)
          .then(msg => {
            botLogger.info(
              `Successfully sent embed (${embed.title}) - id: ${msg.id}`
            );
            botLogger.info(log(SEND_MESSAGE)(msg));
            return msg;
          })
          .catch(msg => {
            botLogger.error(msg);
            throw msg;
          });
      });
  };

  [_findEmbedMessage] = (channel, embed) => {
    // NOTE we assume there are only FETCH_LIMIT messages in the given channel!
    botLogger.info(
      `Looking for embed (${embed.title}) in channel ${channel.name}...`
    );
    return channel.fetchMessages({ limit: FETCH_LIMIT }).then(messages => {
      return new Promise((resolve, reject) => {
        messages.array().forEach(msg => {
          if (msg.embeds.some(e => e.title === embed.title)) {
            resolve(msg);
          }
        });
        reject("Embed not found ¯\\_(ツ)_/¯");
      });
    });
  };

  resetRoles = () => {
    let roles_to_remove = Array.from(this.roleNameMap.values()).map(
      item => item.role
    );
    roles_to_remove.forEach(role =>
      botLogger.info(
        "Resetting role " + role.name + " with id " + role.id + " ..."
      )
    );
    return new Promise(resolve =>
      Promise.all(
        this.guild.members.map(member =>
          member
            .removeRoles(roles_to_remove)
            .then(member =>
              roles_to_remove.forEach(role =>
                botLogger.info(log(ROLE_REMOVE)(member, role))
              )
            )
            .catch(botLogger.error)
        )
      ).then(members => {
        return resolve({ members, removed_roles: roles_to_remove });
      })
    ).catch(botLogger.error);
  };

  resetRolesEmbed = () => {
    return this.embeds.role.message
      .delete()
      .then(msg => {
        botLogger.info(log(DELETE_MESSAGE)(msg));
        this.embeds.role.message = undefined;
        return this[_initEmbed](
          this.embeds.role.channel,
          this.embeds.role.embed
        );
      })
      .then(msg => {
        this.embeds.role.message = msg;
        return this[_addReactionsToRolesEmbed]();
      })
      .catch(botLogger.error);
  };

  [_addReactionsToRolesEmbed] = async () => {
    for (let fn of Array.from(this.roleNameMap.values()).map(item => () => {
      botLogger.info(`Reacting to roles embed with ${item.emoji}`);
      return this.embeds.role.message.react(item.emoji);
    })) {
      await fn();
    }
  };

  updateRolesEmbed = () =>
    this.embeds.role.message
      .edit(this.embeds.role.embed)
      .then(msg => this[_addReactionsToRolesEmbed]())
      .then(() => {
        botLogger.info(`Updated roles embed!`);
      })
      .catch(botLogger.error);
}
