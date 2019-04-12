import fs from "fs";
import { log, TYPE } from "./util";
import { genRoleEmbed, genRoleNameMap, genServerInstance } from "./gen";
import assert from "assert";

const { GENERAL, ERROR, SEND_MESSAGE, ROLE_REMOVE, DELETE_MESSAGE } = TYPE;

// using Symbol marks the variables as "private" since they are harder accessible
const _client = Symbol("client");
const _initEmbed = Symbol("init_embed");
const _findEmbedMessage = Symbol("find_embed_message");
const _resetRolesEmbed = Symbol("reset_roles_embed");
const _addReactionsToRolesEmbed = Symbol("add_reactions_to_roles_embed");
export const FETCH_LIMIT = 30;

export class Server {
  constructor(client) {
    // NOTE we assume the client is already logged in!
    this[_client] = client;
    let config = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
      process.env.NODE_ENV
    ];
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
  }

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
    Promise.all(promises)
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
          this.updateRolesEmbed();
        }
      });
  };

  [_initEmbed] = (channel, embed) => {
    // look if embed already exists
    return this[_findEmbedMessage](channel, embed)
      .then(msg => {
        log(GENERAL)(`Found embed for ${embed.title} - id: ${msg.id}`);
        return msg;
      })
      .catch(err => {
        // if not, create it
        log(ERROR)(err);
        return channel
          .send(embed)
          .then(msg => {
            log(GENERAL)(
              `Successfully sent embed for ${embed.title} - id: ${msg.id}`
            );
            log(SEND_MESSAGE)(msg);
            return msg;
          })
          .catch(msg => {
            log(ERROR)(msg);
            throw msg;
          });
      });
  };

  [_findEmbedMessage] = (channel, embed) => {
    // NOTE we assume there are only FETCH_LIMIT messages in the given channel!
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

  on = (event, handler) => {
    this[_client].on(event, handler(this));
  };

  emit = event => {
    this[_client].emit(event);
  };

  resetRoles = () => {
    let roles_to_remove = Array.from(this.roleNameMap.values()).map(
      item => item.role
    );
    roles_to_remove.forEach(role =>
      log(GENERAL)(
        "Resetting role " + role.name + " with id " + role.id + " ..."
      )
    );
    return new Promise(resolve =>
      Promise.all(
        this.guild.members.map(member =>
          member
            .removeRoles(roles_to_remove)
            .then(member =>
              roles_to_remove.forEach(role => log(ROLE_REMOVE)(member, role))
            )
            .catch(log(ERROR))
        )
      )
        .then(members => resolve({ members, removed_roles: roles_to_remove }))
        .then(() => this[_resetRolesEmbed]())
        .catch(log(ERROR))
    );
  };

  [_resetRolesEmbed] = () => {
    this.embeds.role.embed
      .delete()
      .then(msg => {
        log(DELETE_MESSAGE)(msg);
        this.embeds.role.id = undefined;
        return this[_initEmbed](
          this.embeds.role.channel,
          this.embeds.role.embed
        );
      })
      .then(msg => this[_addReactionsToRolesEmbed]())
      .catch(log(ERROR));
  };

  [_addReactionsToRolesEmbed] = () => {
    return Promise.all(
      Array.from(this.roleNameMap.values()).map(item =>
        this.embeds.role.message.react(item.emoji)
      )
    );
  };

  updateRolesEmbed = () => {
    this.embeds.role.message
      .edit(this.embeds.role.embed)
      .then(msg => this[_addReactionsToRolesEmbed]())
      .then(reactions => {
        log(GENERAL)(`Updated roles embed!`);
      })
      .catch(log(ERROR));
  };
}
