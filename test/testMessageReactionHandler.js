import chai from "chai";
import discord from "discord.js";
import { BotClient } from "../src/botClient";
import fs from "fs";
import {
  messageReactionAddHandler,
  messageReactionRemoveHandler
} from "../src/handlers";
import { clearChannel } from "../src/guild";

const expect = chai.expect;

describe(`Reacting to roles embed should add and remove roles`, function() {
  let client,
    bot,
    addHandler,
    removeHandler,
    devChannel,
    member,
    reaction,
    role,
    roles_backup;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => {
        process.env.NODE_ENV = "development";
        bot = new BotClient(client);
        bot.embeds.role = {
          message: {
            id: "12345"
          }
        };
        reaction = {
          message: {
            id: "12345"
          },
          emoji: {
            id: bot.roleNameMap.values().next().value.emoji.id
          }
        };
        role = Array.from(bot.roleNameMap.values()).find(
          item => item.emoji.id === reaction.emoji.id
        ).role;
        let devConfig = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          "development"
        ];
        member = bot.guild.members.random();
        roles_backup = member.roles
          .map(r => ({ name: r.name, id: r.id }))
          .filter(r => r.name !== "@everyone");
        // remove all roles from member
        devChannel = bot.guild.channels.get(devConfig.channel.dev.id);
        addHandler = messageReactionAddHandler(bot);
        removeHandler = messageReactionRemoveHandler(bot);
        clearChannel(devChannel)
          .then(() => member.removeRoles(member.roles.map(r => r.id)))
          .then(() =>
            expect(member.roles.filter(r => r.name !== "@everyone").size === 0)
          )
          .then(() => done());
      })
      .catch(console.error);
  });

  it(`Adding a reaction should result in adding of associated role`, function(done) {
    addHandler(reaction, member)
      .then(() =>
        expect(
          member.roles
            .array()
            .map(r => r.id)
            .includes(role.id)
        ).to.equal(true)
      )
      .then(() => done())
      .catch(err => done(err));
  });

  it(`Removing a reaction should result in removing of associated role`, function(done) {
    member
      .addRole(role.id)
      .then(() => removeHandler(reaction, member))
      .then(() =>
        expect(
          !member.roles
            .array()
            .map(r => r.id)
            .includes(role.id)
        )
      )
      .then(() => done())
      .catch(err => done(err));
  });

  after(function(done) {
    member
      .addRoles(roles_backup.map(r => r.id))
      .then(() => client.destroy())
      .then(() => done())
      .catch(console.error);
  });
});
