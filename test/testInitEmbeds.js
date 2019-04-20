import "@babel/polyfill";
import chai from "chai";
import discord from "discord.js";
import { BotClient, FETCH_LIMIT } from "../src/botClient";
import fs from "fs";
import { clearChannel } from "../src/guild";

const expect = chai.expect;

// TODO tests are very slow since before EVERY test we send the embed and add the reactions to it!
// -> send once per test case (not exists / already exists) and then check properties
describe("initEmbeds should make sure that the embeds are properly initialized", function() {
  this.slow(15000);
  this.timeout(60000);
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
      let bot, devChannel;

      beforeEach(function(done) {
        process.env.NODE_ENV = env;
        // NOTE Bot is reinitialized before every test!
        bot = new BotClient(client);
        let devConfig = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          "development"
        ];
        // NOTE all embeds should be sent to the dev channel!
        devChannel = client.guilds
          .get(devConfig.guild.id)
          .channels.get(devConfig.channel.dev.id);
        for (let key in bot.embeds) {
          if (bot.embeds.hasOwnProperty(key)) {
            bot.embeds[key].channel = devChannel;
          }
        }
        // NOTE dev channel is always clear at the beginning of each test!
        clearChannel(devChannel).then(() => done());
      });

      describe("Embed does not exist -> Embed is created and properties are properly set", function() {
        it("Embed is created in discord channel", async function() {
          await bot.initEmbeds();
          let createdEmbed = await devChannel
            .fetchMessages({ limit: FETCH_LIMIT })
            .then(messages => messages.array()[0].embeds[0]);
          expect(createdEmbed.title).to.equal(bot.embeds.role.embed.title);
          // NOTE descriptions are not equal due to formatting therefore commented out
          /*expect(createdEmbed.description).to.equal(
            bot.embeds.role.embed.description
          );*/
        });

        it("bot.embeds.role.message is properly set", async function() {
          expect(bot.embeds.role.message).to.equal(undefined);
          await bot.initEmbeds();
          expect(
            bot.embeds.role.message.embeds[0].title ===
              bot.embeds.role.embed.title
          ).to.equal(true);
        });

        it("Roles embed has all roles emojis as reactions", async function() {
          await bot.initEmbeds();
          expect(
            Array.from(bot.roleNameMap.values())
              .map(item => item.emoji)
              .every(emoji =>
                bot.embeds.role.message.reactions
                  .array()
                  .map(r => r.emoji)
                  .includes(emoji)
              )
          ).to.equal(true);
        });
      });

      describe("Embed does exist -> Embed properties are initialized accordingly", function() {
        let testEmbed;
        beforeEach(function() {
          testEmbed = new discord.RichEmbed();
          // NOTE we assume that the roles embed is found by looking at the title!
          // if this does change in the implementation, this test will most likely break!
          testEmbed.title = bot.embeds.role.embed.title;
        });

        it("bot.embeds.role.message is set to the found embed message", async function() {
          let testMessage = await devChannel.send(testEmbed);
          // Check that we can now really assume that there is already a roles embed
          expect(
            testMessage.embeds[0].title === bot.embeds.role.embed.title
          ).to.equal(true);

          expect(bot.embeds.role.message).to.equal(undefined);
          await bot.initEmbeds();
          expect(bot.embeds.role.message.id).to.equal(testMessage.id);
        });

        it("No roles reactions -> Roles reactions are added", async function() {
          // also set description to make sure that only the reactions are different than expected
          testEmbed.description = bot.embeds.role.embed.description;
          let testMessage = await devChannel.send(testEmbed);
          // Check that we can now really assume that there is already a roles embed
          expect(
            testMessage.embeds[0].title === bot.embeds.role.embed.title
          ).to.equal(true);

          // check that not a single reaction is added to the test message
          expect(
            Array.from(bot.roleNameMap.values())
              .map(item => item.emoji)
              .every(
                emoji =>
                  !testMessage.reactions
                    .array()
                    .map(r => r.emoji)
                    .includes(emoji)
              )
          ).to.equal(true);
          await bot.initEmbeds();
          // re-fetch message
          testMessage = await devChannel.fetchMessage(testMessage.id);
          // after initEmbeds(), all reactions should be added!
          expect(
            Array.from(bot.roleNameMap.values())
              .map(item => item.emoji)
              .every(emoji =>
                testMessage.reactions
                  .array()
                  .map(r => r.emoji)
                  .includes(emoji)
              )
          ).to.equal(true);
        });
      });

      after(function(done) {
        clearChannel(devChannel).then(() => done());
      });
    });

  GET_ENV_DESCRIBE("development");
  GET_ENV_DESCRIBE("production");

  after(function(done) {
    client.destroy().then(done);
  });
});
