import cheerio from "cheerio";
import request from "request";
import util from "util";
import { log, TYPE } from "../util";
import Lecture from "../model/Lectures";
import discord from "discord.js";

const { ERROR, SEND_MESSAGE, DB } = TYPE;

const req = util.promisify(request);

export const PEP2_LECTURE_NAME = "Theoretische Physik II";
export const PEP2_UPDATE = bot => async () => {
  const UEBUNGEN_PHYSIK_URL = "https://uebungen.physik.uni-heidelberg.de";
  const PEP2_URL_SUFFIX = "/vorlesung/20191/ptp2";

  let $ = await req(UEBUNGEN_PHYSIK_URL + PEP2_URL_SUFFIX)
    .then(res => cheerio.load(res.body))
    .catch(err => {
      log(ERROR)(err);
      return null;
    });
  const hrefs = $("#infoarea-5631")
    .find("ul > li > a")
    .map(function(i, el) {
      return UEBUNGEN_PHYSIK_URL + $(this).attr("href");
    })
    .get();
  const scrape = hrefs.map((h, i) => ({
    text: `Blatt ${i + 1}`,
    href: h
  }));
  handleUpdate(bot)(PEP2_LECTURE_NAME, scrape, $.root().html());
};

const handleUpdate = bot => (DB_LECTURE_NAME, scrape, html) => {
  Lecture.findOne({ name: DB_LECTURE_NAME }, "updates color channel", function(
    err,
    lec
  ) {
    if (err) throw err;
    if (lec.updates.length > 0) {
      // there is at least one element already in updates!
      // NOTE should checking for difference be more sophisticated or is this enough?
      let diff =
        scrape.length - lec.updates[lec.updates.length - 1].scrape.length;
      if (diff > 0) {
        // a previously not scraped element is found!
        // send notification!
        let channel = bot.guild.channels.get(lec.channel);
        let title = `**${DB_LECTURE_NAME}: Neues Blatt!**`;
        let description = scrape
          .slice(diff)
          .map((el, i) => `${el.text}\n${el.href}\n\n`)
          .join("");
        const embed = new discord.RichEmbed()
          .setTitle(title)
          .setDescription(description)
          .setColor(lec.color);
        channel
          .send(embed)
          .then(log(SEND_MESSAGE))
          .catch(log(ERROR));
        // save new update in document
        lec.updates.push({
          scrape,
          html,
          notification: {
            title,
            description
          }
        });
        lec.save();
        log(DB)(`Updated ${DB_LECTURE_NAME}`);
      }
      log(DB)(`No update for ${DB_LECTURE_NAME}`);
    } else {
      log(DB)(`First time scraped data saved for ${DB_LECTURE_NAME}`);
      // first time saving state of website
      lec.updates.push({ scrape, html });
      lec.save();
    }
  });
};
