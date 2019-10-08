import chai from "chai";
import discord from "discord.js";
import { genRoleNameMap } from "../src/gen.js";
import fs from "fs";
import YAML from "yaml";

const expect = chai.expect;

describe("genRoleNameMap should return a valid map according to config", function() {
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
      let config, roleNameMap;
      before(function() {
        process.env.NODE_ENV = env;
        config = YAML.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
          process.env.NODE_ENV
        ];
        let guild = client.guilds.get(config.guild.id);
        roleNameMap = genRoleNameMap(config, guild);
      });

      it("all roles listed in config with an emoji should be in the map", function() {
        expect(
          config.roles
            .filter(item => item.emoji)
            .map(item => item.role.id)
            .every(id =>
              Array.from(roleNameMap.values()).some(v => v.role.id === id)
            )
        ).to.equal(true);
      });
      it("the keys should map to the object defined in the config", function() {
        expect(
          config.roles
            .filter(item => item.emoji)
            .every(item => {
              let mappedObject = roleNameMap.get(item.name);
              return mappedObject.role.id === item.role.id &&
                mappedObject.emoji.id === item.emoji.id &&
                item.channel
                ? mappedObject.channel.id === item.channel.id
                : true;
            })
        );
      });
    });
  GET_ENV_DESCRIBE("development");
  GET_ENV_DESCRIBE("production");

  after(function(done) {
    client.destroy().then(done);
  });
});
