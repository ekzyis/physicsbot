import { log, TYPE } from "../util";
import puppeteer from "puppeteer";
import { handleUpdate, load_with_cheerio, moodle_scraper } from "./util";
import {
  HEIBOX_UNI_HD_URL,
  UEBUNGEN_PHYSIK_URL,
  PUPPETEER,
  REQUEST,
  MOODLE_URL
} from "./const";

const { ERROR } = TYPE;

export const PTP1_LECTURE_NAME = "Theoretische Physik I";
export const PTP1_UPDATE = bot => async () => {
  const PTP1_URL_SUFFIX = "/vorlesung/20192/1058";
  const url = UEBUNGEN_PHYSIK_URL + PTP1_URL_SUFFIX;
  load_with_cheerio(url)
    .then($ => {
      const scrape = $("#infoarea-6191")
        .find("ul > li > a")
        .map(function(i, el) {
          return {
            href: UEBUNGEN_PHYSIK_URL + $(this).attr("href"),
            text: $(this).text()
          };
        })
        .get();
      return handleUpdate(bot)(PTP1_LECTURE_NAME, scrape, { download: false });
    })
    .catch(log(ERROR));
};

export const ANA1_LECTURE_NAME = "Analysis 1";
export const ANA1_UPDATE = bot => async () => {
  const HEIBOX_ANA1_SUFFIX = "/d/0583bd9e56af4b5ab9db";
  const url = HEIBOX_UNI_HD_URL + HEIBOX_ANA1_SUFFIX;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.type(
    "#share-passwd-form > input.input",
    "Ana19&Cauchy-Schwarz_20"
  );
  await page.click("#share-passwd-form > input[type=submit]:nth-child(7)");
  await page.waitForSelector("#wrapper > div > div.o-auto > div > table");
  await page.goto(url + "/?p=%2F%C3%9Cbungsbl%C3%A4tter&mode=list");
  await page.waitForSelector("#wrapper > div > div.o-auto > div > table");
  const scrape = (await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "#wrapper > div > div.o-auto > div > table > tbody > tr > td > a"
      ),
      el => ({ text: el.textContent, href: el.href })
    )
  )).filter(el => !!el.text);
  handleUpdate(bot)(ANA1_LECTURE_NAME, scrape, { download: false });
  await browser.close();
};

export const PEP1_LECTURE_NAME = "Experimentalphysik I";
export const PEP1_UPDATE = bot => async (options = { scraper: PUPPETEER }) => {
  const PEP1_URL_SUFFIX = "/vorlesung/20192/pep1";
  const url = UEBUNGEN_PHYSIK_URL + PEP1_URL_SUFFIX;
  let scrape = [];
  if (options.scraper === PUPPETEER) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    scrape = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("#infoarea-6406 > ul > li > ul > li > a"),
        el => ({
          text: el.textContent,
          href: el.href
        })
      )
    );
    await browser.close();
  } else if (options.scraper === REQUEST) {
  }
  handleUpdate(bot)(PEP1_LECTURE_NAME, scrape, { download: false });
};

export const PEP3_LECTURE_NAME = "Experimentalphysik III";
export const PEP3_UPDATE = bot => async () => {
  const PEP3_URL_SUFFIX = "/course/view.php?id=22982";
  const scrape = await moodle_scraper(PEP3_URL_SUFFIX);
  handleUpdate(bot)(PEP3_LECTURE_NAME, scrape);
};
