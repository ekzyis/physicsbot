import "@babel/polyfill";
import chai from "chai";
import discord from "discord.js";
import fs from "fs";
import { BotClient } from "../src/botClient";
import { COMMAND_RESET_ROLES, commandHandler } from "../src/command";

const expect = chai.expect;

const ROLES_BACKUP_FILE = "testResetRoles_roles_backup.json";

describe(`Writing ${COMMAND_RESET_ROLES} with sufficient permissions should trigger resetting of all roles in guild`, function() {
  this.timeout(180000);
  let client;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => done())
      .catch(console.error);
  });

  const GET_ENV_DESCRIBE = env =>
    describe(`${env} environment`, function() {
      let bot,
        roles_backup,
        message = {};
      before(function() {
        process.env.NODE_ENV = env;
        bot = new BotClient(client);
        message.content = COMMAND_RESET_ROLES;
        message.reply = () => Promise.resolve("");
      });

      // TODO this with afterEach() takes a very long time .... is there a better solution?
      // TODO add progress bar
      beforeEach(function() {
        // Make a backup of all roles to re-add them after each test
        roles_backup = bot.guild.members.map(m => ({
          tag: m.user.tag,
          id: m.id,
          roles: m.roles
            .map(r => ({ name: r.name, id: r.id }))
            .filter(r => r.name !== "@everyone")
        }));
        fs.writeFile(
          ROLES_BACKUP_FILE,
          JSON.stringify(roles_backup, null, 2),
          "utf8",
          err => {
            if (err) {
              throw err;
            }
          }
        );
      });

      it("Without permissions, bot did not change roles", function(done) {
        message.author = bot.guild.members.find(
          m => !m.hasPermission("MANAGE_ROLES")
        );
        const calcAmountOfGivenRoles = () =>
          bot.guild.members.reduce((acc, curr) => acc + curr.roles.size, 0);
        let amountOfGivenRolesBeforeCommand = calcAmountOfGivenRoles();
        commandHandler(bot)(message)
          .then(() => {
            let amountOfGivenRolesAfterCommand = calcAmountOfGivenRoles();
            expect(amountOfGivenRolesBeforeCommand).to.equal(
              amountOfGivenRolesAfterCommand
            );
            done();
          })
          .catch(() => {
            throw "commandHandler threw an error.";
          });
      });

      // TODO add progress bar
      it("With enough permissions, bot did reset all roles", function(done) {
        message.author = bot.guild.members.find(m =>
          m.hasPermission("MANAGE_ROLES")
        );
        commandHandler(bot)(message)
          .then(() => {
            expect(
              bot.guild.members.every(m =>
                m.roles.every(
                  r =>
                    !Array.from(bot.roleNameMap.values())
                      .map(i => i.role)
                      .includes(r)
                )
              )
            ).to.equal(true);
            done();
          })
          .catch(() => {
            throw "commandHandler threw an error.";
          });
      });

      // TODO add progress bar
      afterEach(async function() {
        try {
          let backup = JSON.parse(fs.readFileSync(ROLES_BACKUP_FILE, "utf8"));
          for (let b of backup) {
            let member = await bot.guild.fetchMember(b.id);
            for (let r of b.roles) {
              // add one role at a time
              await member.addRole(r.id).catch(console.error);
            }
          }
          fs.unlinkSync(ROLES_BACKUP_FILE);
        } catch (err) {
          console.error(err);
        }
      });
    });

  GET_ENV_DESCRIBE("development");

  after(function(done) {
    client.destroy().then(() => done());
  });
});
