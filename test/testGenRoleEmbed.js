import chai from "chai";
import discord from "discord.js";
import { genRoleEmbed, ROLE_EMBED_TITLE as title } from "../src/gen.js";
import fs from "fs";
import YAML from "yaml";

const expect = chai.expect;

describe(`genRoleEmbed should return an embed which includes the roles with emojis and has title ${title}`, function() {
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
      let config, embed;
      before(function() {
        process.env.NODE_ENV = env;
        config = YAML.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          process.env.NODE_ENV
        ];
        const getConfigGuild = () => client.guilds.get(config.guild.id);
        let testMap = new Map();
        config.roles
          .filter(item => item.emoji)
          .forEach(item => {
            let value = {
              role: getConfigGuild().roles.get(item.role.id),
              emoji: getConfigGuild().emojis.get(item.emoji.id)
            };
            if (!!item.channel) {
              value.channel = getConfigGuild().channels.get(item.channel.id);
            }
            testMap.set(item.name, value);
          });
        let overviewChannel = getConfigGuild().channels.get(
          config.channel.overview.id
        );
        embed = genRoleEmbed(overviewChannel, testMap);
      });

      it("Embed description includes roles and their associated emoji", function() {
        expect(
          config.roles
            .filter(item => item.emoji)
            .every(
              item =>
                embed.description.includes(item.role.id) &&
                embed.description.includes(item.emoji.id)
            )
        ).to.equal(true);
      });
      it(`Embed has title ${title}`, function() {
        expect(embed.title === title).to.equal(true);
      });
    });

  GET_ENV_DESCRIBE("development");
  GET_ENV_DESCRIBE("production");

  after(function(done) {
    client.destroy().then(done);
  });
});
