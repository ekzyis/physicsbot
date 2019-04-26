import chai from "chai";
import discord from "discord.js";
import { BotClient } from "../src/botClient";
import { GREETING_EMBED_TITLE, guildMemberAddHandler } from "../src/handlers";
import fs from "fs";
import { clearChannel } from "../src/guild";

const expect = chai.expect;

describe(`If a new member enters the guild, the bot should greet him`, function() {
  let client, bot, handler;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => {
        process.env.NODE_ENV = "development";
        bot = new BotClient(client);
        let devConfig = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          "development"
        ];
        bot.defaultChannel = bot.guild.channels.get(devConfig.channel.dev.id);
        handler = guildMemberAddHandler(bot);
        clearChannel(bot.defaultChannel).then(() => done());
      })
      .catch(console.error);
  });

  it(`An embed is sent to the default channel`, function(done) {
    const member = bot.guild.members.random();
    handler(member)
      .then(() => bot.defaultChannel.fetchMessages({ limit: 1 }))
      .then(messages => {
        expect(messages.array()[0].embeds[0].title).to.equal(
          GREETING_EMBED_TITLE(bot, member).trim()
        );
        done();
      })
      .catch(err => done(err));
  });

  after(function(done) {
    clearChannel(bot.defaultChannel)
      .then(() => client.destroy())
      .then(() => done());
  });
});
