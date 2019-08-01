import "@babel/polyfill";
import chai from "chai";
import discord from "discord.js";
import { BotClient } from "../src/botClient";
import Lecture from "../src/model/Lectures";
import {
  ANA2_LECTURE_NAME,
  PEP2_LECTURE_NAME,
  PTP2_LECTURE_NAME
} from "../src/scrape";

const expect = chai.expect;

describe.only(`All lectures are initialized in MongoDB as own documents`, function() {
  let client;
  before(function(done) {
    client = new discord.Client();
    client
      .login(process.env.TOKEN)
      .then(() => done())
      .catch(console.error);
  });
  let bot;
  before(function(done) {
    process.env.NODE_ENV = "development";
    bot = new BotClient(client);
    bot.connect(`mongodb://localhost/physicsbot_test`);
    bot
      .initDB()
      .then(() => done())
      .catch(done);
  });

  // we assume database is empty since we drop it after testing
  it(`Lectures are initialized when they don't already exist`, function(done) {
    const LECTURES = [ANA2_LECTURE_NAME, PEP2_LECTURE_NAME, PTP2_LECTURE_NAME];
    const promises = Promise.all(
      LECTURES.map(lec => {
        return new Promise((resolve, reject) => {
          Lecture.countDocuments({ name: lec }, (err, count) => {
            if (err) reject(err);
            expect(count).to.equal(1);
            resolve();
          });
        });
      })
    );
    promises.then(() => done()).catch(err => done(err));
  });

  after(function(done) {
    bot.db.dropDatabase((err, ok) => {
      if (err) console.error(err);
      if (ok) console.log("Dropped test database");
      bot.db.close();
    });
    client
      .destroy()
      .then(() => done())
      .catch(err => done(err));
  });
});
