import cheerio from "cheerio";
import request from "request";
import util from "util";
import { log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import discord from "discord.js";
import fs from "fs";

const { ERROR, SEND_MESSAGE, DB } = TYPE;

const req = util.promisify(request);
const reqpost = util.promisify(request.post);

const UEBUNGEN_PHYSIK_URL = "https://uebungen.physik.uni-heidelberg.de";
const MOODLE_URL = "https://elearning2.uni-heidelberg.de";
const MOODLE_URL_LOGIN = "https://elearning2.uni-heidelberg.de/login/index.php";
const MATHI_UNI_HD_URL = "https://www.mathi.uni-heidelberg.de";

export const PTP2_LECTURE_NAME = "Theoretische Physik II";
export const PTP2_UPDATE = bot => async () => {
  const PTP2_URL_SUFFIX = "/vorlesung/20191/ptp2";

  let $ = await req(UEBUNGEN_PHYSIK_URL + PTP2_URL_SUFFIX)
    .then(res => cheerio.load(res.body))
    .catch(err => {
      log(ERROR)(err);
      return null;
    });
  const scrape = $("#infoarea-5631")
    .find("ul > li > a")
    .map(function(i, el) {
      return {
        href: UEBUNGEN_PHYSIK_URL + $(this).attr("href"),
        text: $(this).text()
      };
    })
    .get();
  handleUpdate(bot)(PTP2_LECTURE_NAME, scrape);
};

const MOODLE_CREDENTIALS_PATH = "moodle_creds.json";
const moodle_login = async () => {
  const cookieJar = request.jar();
  await req({
    url: MOODLE_URL_LOGIN,
    followAllRedirects: true,
    jar: cookieJar
  })
    .then(res => {
      const $ = cheerio.load(res.body);
      // Get the login token needed for the login POST request 😏
      const logintoken = $('#login > input[type="hidden"]:nth-child(6)').attr(
        "value"
      );
      // Login!
      const creds = JSON.parse(fs.readFileSync(MOODLE_CREDENTIALS_PATH));
      return reqpost({
        url: MOODLE_URL_LOGIN,
        form: {
          ...creds,
          logintoken,
          anchor: ""
        },
        followAllRedirects: true,
        jar: cookieJar
      });
    })
    .catch(log(ERROR));
  return cookieJar;
};

export const PEP2_LECTURE_NAME = "Experimentalphysik II";
export const PEP2_UPDATE = bot => async () => {
  const PEP2_URL_SUFFIX = "/course/view.php?id=21423";
  const cookieJar = await moodle_login();
  const $ = await req(MOODLE_URL + PEP2_URL_SUFFIX, {
    jar: cookieJar
  })
    .then(res => cheerio.load(res.body))
    .catch(log(ERROR));
  const scrape = $("span.instancename")
    .filter((i, el) => {
      // filter all elements which have a PDF icon next to them
      return !!$(el)
        .prev()
        .attr("src")
        .match(/core\/1547554624\/f\/pdf-24$/);
    })
    .map((i, el) => {
      // the parent is the <a> tag with the link for downloading
      return {
        text: $(el)
          .parent()
          .text()
          .replace(/ Datei/, ""),
        href: $(el)
          .parent()
          .attr("href")
      };
    })
    .get();
  handleUpdate(bot)(PEP2_LECTURE_NAME, scrape);
};

export const ANA2_LECTURE_NAME = "Analysis 2";
export const ANA2_UPDATE = bot => async () => {
  const ANA2_URL_SUFFIX = "/~hofmann/files/ana2.html";
  let $ = await req(MATHI_UNI_HD_URL + ANA2_URL_SUFFIX)
    .then(res => cheerio.load(res.body))
    .catch(err => {
      log(ERROR)(err);
      return null;
    });
  const scrape = $(
    "#MainColumn > table > tbody > tr > td > table:nth-child(15) > tbody > tr:nth-child(3) > td > table > tbody"
  )
    .find("li")
    .map((i, el) => {
      let text = $(el)
        .contents()[0]
        .data.trim();
      let href =
        MATHI_UNI_HD_URL +
        ANA2_URL_SUFFIX.replace("ana2.html", "") +
        $(el)
          .find("a")
          .attr("href")
          .slice(2);
      return { text, href };
    })
    .get();
  handleUpdate(bot)(ANA2_LECTURE_NAME, scrape);
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
    .catch(log(ERROR));
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
    .then(log(SEND_MESSAGE))
    .catch(log(ERROR))
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
          .then(log(SEND_MESSAGE))
          .catch(log(ERROR));
      }
    });
};

const handleUpdate = bot => (DB_LECTURE_NAME, scrape) => {
  Lecture.findOne(
    { name: DB_LECTURE_NAME },
    "name updates color channel",
    async function(err, lec) {
      if (err) throw err;
      if (lec.updates.length > 0) {
        // there is at least one element already in updates!
        let previouslyScraped = lec.updates[lec.updates.length - 1].scrape;
        let added = addedDiff(previouslyScraped, scrape);
        let removed = removedDiff(previouslyScraped, scrape);
        if (added.length !== 0) {
          // a previously not scraped element is found!
          // download material
          let files = await Promise.all(
            added.map(item => download(item, DB_LECTURE_NAME))
          );
          // send notification!
          let channel = bot.guild.channels.get(lec.channel);
          await createUpdateNotification(channel, lec, added, files);
          // save new update in document
          lec.updates.push({ time: new Date(), scrape });
          lec.save();
          log(DB)(`Updated ${DB_LECTURE_NAME}`);
        }
        if (removed.length !== 0) {
          let logMessage = `Following items have been removed for ${DB_LECTURE_NAME}: ${removed}`;
          // Write superuser a direct message since this should not happen!
          let config = JSON.parse(fs.readFileSync(process.env.CONFIG, "utf8"))[
            "development"
          ];
          let superUserRoleId = config.roles.find(r => r.name === "Superuser")
            .role.id;
          let superuser = bot.guild.members.find(member =>
            member.roles.some(r => r.id === superUserRoleId)
          );
          superuser
            .createDM()
            .then(dmChannel => dmChannel.send(logMessage))
            .catch(log(ERROR));
          log(DB)(logMessage);
          // save new update in document
          lec.updates.push({ time: new Date(), scrape });
          lec.save();
          log(DB)(`Updated ${DB_LECTURE_NAME}`);
        }
      } else {
        log(DB)(`First time scraped data saved for ${DB_LECTURE_NAME}`);
        // download data
        let files = await Promise.all(
          scrape.map(item => download(item, DB_LECTURE_NAME))
        );
        // first time saving state of website
        lec.updates.push({ time: new Date(), scrape });
        if (process.env.NODE_ENV === "development") {
          let channel = bot.guild.channels.get(lec.channel);
          await createUpdateNotification(channel, lec, scrape, files);
        }
        lec.save();
      }
    }
  );
};
