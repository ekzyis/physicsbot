import cheerio from "cheerio";
import util from "util";
import { dbLogger, scrapeLogger, botLogger, log, TYPE } from "../util";
import request from "request";
import fs from "fs";
import discord from "discord.js";
import { MOODLE_URL, MOODLE_URL_LOGIN } from "./const";
import Lecture from "../model/Lectures";
import YAML from "yaml";

const { SEND_MESSAGE } = TYPE;
const req = util.promisify(request);
const reqpost = util.promisify(request.post);
const SCRAPE_ERROR = url => new Error(`Could not scrape website ${url}`);

export const load_with_cheerio = async (url, options = {}) => {
  options.url = url;
  let $ = await req(options)
    .then(res => cheerio.load(res.body))
    .catch(err => {
      scrapeLogger.error(err);
      return null;
    });
  if (!$) throw SCRAPE_ERROR(url);
  else return $;
};

const moodle_login = async () => {
  const cookieJar = request.jar();
  await req({
    url: MOODLE_URL_LOGIN,
    followAllRedirects: true,
    jar: cookieJar
  })
    .then(res => {
      const $ = cheerio.load(res.body);
      // Get the login token needed for the login POST request
      const logintoken = $('#login > input[type="hidden"]:nth-child(3)').attr(
        "value"
      );
      // Login!
      const { name, password } = YAML.parse(
        fs.readFileSync(process.env.CREDS, "utf8")
      ).find(({ url }) => MOODLE_URL_LOGIN.match(url));
      return reqpost({
        url: MOODLE_URL_LOGIN,
        form: {
          username: name,
          password,
          logintoken,
          anchor: ""
        },
        followAllRedirects: true,
        jar: cookieJar
      });
    })
    .catch(scrapeLogger.error);
  return cookieJar;
};

export const moodle_scraper = async suffix => {
  const cookieJar = await moodle_login();
  const url = MOODLE_URL + suffix;
  return load_with_cheerio(url, { jar: cookieJar })
    .then($ => {
      return $("span.instancename")
        .filter((i, el) => {
          // filter all elements which have a PDF icon next to them
          return !!$(el)
            .parent()
            .attr("href")
            .match(/mod\/resource\/view\.php\?id=[0-9]+$/);
        })
        .map((i, el) => {
          // the parent is the <a> tag with the link for downloading
          return {
            text: $(el)
              .parent()
              .text(),
            href: $(el)
              .parent()
              .attr("href")
          };
        })
        .get();
    })
    .catch(err => {
      // log error and then rethrow to keep promise chain rejected
      scrapeLogger.error(err);
      throw err;
    });
};

const areEqual = (item1, item2) =>
  item1.text === item2.text && item1.href === item2.href;

const addedDiff = (oldScraped, newScraped) =>
  newScraped.filter(
    newItem => !oldScraped.some(oldItem => areEqual(oldItem, newItem))
  );

const removedDiff = (oldScraped, newScraped) =>
  oldScraped.filter(
    oldItem => !newScraped.some(newItem => areEqual(oldItem, newItem))
  );

const download = async (item, lectureName) => {
  let cookieJar = null;
  if (item.href.startsWith(MOODLE_URL)) {
    cookieJar = await moodle_login();
  }
  return req({
    url: item.href,
    followAllRedirects: true,
    jar: cookieJar,
    encoding: null
  })
    .then(res => {
      let dateFileNameFormat = new Date()
        .toISOString()
        .replace(/\..+/, "")
        .replace(/:/g, "")
        .replace(/-/g, "");
      let filename = `${lectureName.replace(/\s/g, "_")}_${item.href
        .split("/")
        .slice(-1)}_${dateFileNameFormat}`;
      if (!fs.existsSync("download")) {
        fs.mkdirSync("download");
      }
      fs.writeFileSync(`download/${filename}`, res.body);
      return `download/${filename}`;
    })
    .catch(scrapeLogger.error);
};

const createUpdateNotification = (channel, lecDocument, added, files) => {
  let title = `**${lecDocument.name}: Neue Materialien verfügbar!**`;
  let description = added.map((el, i) => `${el.text}\n${el.href}\n\n`).join("");
  let attachments = files.map((f, i) => ({
    name: `${lecDocument.name}_${added[i].text}${
      added[i].text.match(/\.pdf$/) ? "" : ".pdf"
    }`,
    attachment: f
  }));
  let embed = new discord.RichEmbed()
    .setTitle(title)
    .setDescription(description)
    .setColor(lecDocument.color);
  return channel
    .send(embed)
    .then(msg => botLogger.info(log(SEND_MESSAGE)(msg)))
    .catch(botLogger.error)
    .then(async () => {
      // create chunks of size 10
      let chunks = attachments.reduce((all, one, i) => {
        const ch = Math.floor(i / 10);
        all[ch] = [].concat(all[ch] || [], one);
        return all;
      }, []);
      for (let chunk of chunks) {
        await channel
          .send({
            files: chunk
          })
          .then(msg => botLogger.info(log(SEND_MESSAGE)(msg)))
          .catch(botLogger.error);
      }
    });
};

export const handleUpdate = bot => (
  DB_LECTURE_NAME,
  scrape,
  options = { download: true }
) => {
  scrapeLogger.info(`${DB_LECTURE_NAME} - Scraped data (${scrape.length}):`);
  scrape.forEach(({ href, text }) => {
    scrapeLogger.info({ href, text });
  });
  Lecture.findOne(
    { name: DB_LECTURE_NAME },
    "name updates color channel",
    async function(err, lec) {
      if (err) return scrapeLogger.error(err);
      if (lec.updates.length > 0) {
        // there is at least one element already in updates!
        let previouslyScraped = lec.updates[lec.updates.length - 1].scrape;
        let added = addedDiff(previouslyScraped, scrape);
        let removed = removedDiff(previouslyScraped, scrape);
        if (added.length !== 0) {
          // a previously not scraped element is found!
          // download material
          let files = [];
          if (options.download) {
            files = await Promise.all(
              added.map(item => download(item, DB_LECTURE_NAME))
            );
          }
          // send notification!
          let channel = bot.guild.channels.get(lec.channel);
          await createUpdateNotification(channel, lec, added, files);
          // save new update in document
          lec.updates.push({ time: new Date(), scrape });
          lec.save();
          dbLogger.info(`Updated ${DB_LECTURE_NAME}`);
        }
        if (removed.length !== 0) {
          let removedDescription = removed
            .map(i => `{ text: ${i.text}, href: ${i.href} }`)
            .join("\n");
          let logMessage = `Following items have been removed for ${DB_LECTURE_NAME}:\n${removedDescription}`;
          // Write superuser a direct message since this should not happen!
          let config = YAML.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
            "development"
          ];
          let superUserRoleId = config.roles.find(r => r.name === "Superuser")
            .role.id;
          let superuser = bot.guild.members.find(member =>
            member.roles.some(r => r.id === superUserRoleId)
          );
          // FIXME for some reason superuser is only SOMETIMES null?
          if (!superuser) return scrapeLogger.error(`Superuser not found!`);
          superuser
            .createDM()
            .then(dmChannel => dmChannel.send(logMessage))
            .then(msg => botLogger.info(log(SEND_MESSAGE)(msg)))
            .catch(scrapeLogger.error);
          // FIXME for some reason sometimes nothing is scraped - bad internet connection?
          //dbLogger.info(logMessage);
          // save new update in document
          //lec.updates.push({ time: new Date(), scrape });
          //lec.save();
          //dbLogger.info(`Updated ${DB_LECTURE_NAME}`);
        }
      } else {
        dbLogger.info(`First time scraped data saved for ${DB_LECTURE_NAME}`);
        // download data
        let files = [];
        /*if (options.download)
          files = await Promise.all(
            scrape.map(item => download(item, DB_LECTURE_NAME))
          );*/
        // first time saving state of website
        lec.updates.push({ time: new Date(), scrape });
        /*if (process.env.NODE_ENV === "development") {
          let channel = bot.guild.channels.get(lec.channel);
          await createUpdateNotification(channel, lec, scrape, files);
        }*/
        lec.save();
      }
    }
  );
};
