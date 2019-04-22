import "@babel/polyfill";
import chai from "chai";
import discord from "discord.js";
import { BotClient } from "../src/botClient";
import { COMMAND_CLEAR_CHANNEL, commandHandler } from "../src/command";

const expect = chai.expect;
const assert = chai.assert;

describe(`Writing ${COMMAND_CLEAR_CHANNEL} with sufficient permissions should clear the channel but only in development mode`, function() {
  this.slow(15000);
  let client;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => done())
      .catch(console.error);
  });
  let bot, testChannel, testMessages, cmdMessage, everyoneRole;
  before(function() {
    process.env.NODE_ENV = "development";
    bot = new BotClient(client);
    testMessages = "This are some test messages!".split(" ");
    cmdMessage = {};
    cmdMessage.content = COMMAND_CLEAR_CHANNEL;
    everyoneRole = bot.guild.roles.find(r => r.name === "@everyone");
  });

  beforeEach(function(done) {
    // Create a new channel just for this test
    bot.guild
      .createChannel("TEST_CLEAR_CHANNEL", "text", [
        {
          id: everyoneRole.id,
          denied: ["VIEW_CHANNEL"]
        },
        {
          id: bot.id,
          allowed: ["VIEW_CHANNEL"]
        }
      ])
      .then(channel => {
        testChannel = channel;
        cmdMessage.channel = channel;
        return channel;
      })
      .then(c => Promise.all(testMessages.map(m => c.send(m))))
      .then(() => done())
      .catch(err => done(err));
  });

  it("All messages are deleted if process is in development mode", function(done) {
    // NOTE mhh.. probably bad style to change environment variables during execution...
    process.env.NODE_ENV = "development";
    cmdMessage.author = bot.guild.members.find(m =>
      m.hasPermission("MANAGE_GUILD")
    );
    commandHandler(bot)(cmdMessage)
      .then(() => testChannel.fetchMessages({ limit: testMessages.length }))
      .then(messages => expect(messages.size).to.equal(0))
      .then(() => done())
      .catch(err => done(err));
  });

  it("No message is deleted if process is not in development mode", function(done) {
    // NOTE mhh.. probably bad style to change environment variables during execution...
    process.env.NODE_ENV = "production";
    cmdMessage.author = bot.guild.members.find(m =>
      m.hasPermission("MANAGE_GUILD")
    );
    commandHandler(bot)(cmdMessage).then(
      () => {
        done(new Error("commandHandler should throw error"));
      },
      err => {
        return testChannel
          .fetchMessages({ limit: testMessages.length })
          .then(msgs => expect(msgs.size).to.equal(testMessages.length))
          .then(() => done())
          .catch(err => done(err));
      }
    );
  });

  it("No message is deleted if author has not permission MANAGE_GUILD", function(done) {
    // NOTE mhh.. probably bad style to change environment variables during execution...
    process.env.NODE_ENV = "development";
    cmdMessage.author = bot.guild.members.find(
      m => !m.hasPermission("MANAGE_GUILD")
    );
    commandHandler(bot)(cmdMessage).then(
      () => {
        done(new Error("commandHandler should throw error"));
      },
      err => {
        return testChannel
          .fetchMessages({ limit: testMessages.length })
          .then(msgs => expect(msgs.size).to.equal(testMessages.length))
          .then(() => done())
          .catch(err => done(err));
      }
    );
  });

  afterEach(function(done) {
    testChannel
      .delete()
      .then(() => done())
      .catch(err => done(err));
  });

  after(function(done) {
    client
      .destroy()
      .then(() => done())
      .catch(err => done(err));
  });
});
