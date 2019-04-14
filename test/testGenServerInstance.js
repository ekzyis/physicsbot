import chai from "chai";
import discord from "discord.js";
import { genServerInstance } from "../src/gen.js";
import fs from "fs";

const expect = chai.expect;

describe("genServerInstance should return a valid instance according to config", function() {
  this.timeout(15000);
  let client;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => done())
      .catch(console.error);
  });

  const GET_ENV_SUITE = env =>
    describe(`${env} environment`, function() {
      let instance, config;
      before(function() {
        process.env.NODE_ENV = env;
        config = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          process.env.NODE_ENV
        ];
        instance = genServerInstance(config, client);
      });

      const getConfigGuild = () => client.guilds.get(config.guild.id);
      const getConfigChannel = id => getConfigGuild().channels.get(id);

      it("guild is properly set", function() {
        let guild = getConfigGuild();
        expect(instance.guild).to.equal(guild);
      });
      it("default channel is properly set", function() {
        let defaultChannel = getConfigChannel(config.channel.default.id);
        expect(instance.defaultChannel).to.equal(defaultChannel);
      });
      it("rules channel is properly set", function() {
        let rulesChannel = getConfigChannel(config.channel.rules.id);
        expect(instance.rulesChannel).to.equal(rulesChannel);
      });
      it("overview channel is properly set", function() {
        let overviewChannel = getConfigChannel(config.channel.overview.id);
        expect(instance.overviewChannel).to.equal(overviewChannel);
      });
      if (env === "development") {
        it("dev channel is properly set", function() {
          let devChannel = getConfigChannel(config.channel.dev.id);
          expect(instance.devChannel).to.equal(devChannel);
        });
      }
    });

  GET_ENV_SUITE("development");
  GET_ENV_SUITE("production");

  after(function(done) {
    client.destroy().then(done);
  });
});
