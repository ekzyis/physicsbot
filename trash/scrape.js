import cheerio from "cheerio";
import { log } from "../src/util";
import util from "util";
import request from "request";
import fs from "fs";

const req = util.promisify(request);
const reqpost = util.promisify(request.post);

const UEBUNGEN_PHYSIK_URL = "https://uebungen.physik.uni-heidelberg.de";
const MOODLE_URL = "https://elearning2.uni-heidelberg.de";
const MOODLE_URL_LOGIN = "https://elearning2.uni-heidelberg.de/login/index.php";
const MATHI_UNI_HD_URL = "https://www.mathi.uni-heidelberg.de";

const SCRAPE_ERROR = url => new Error(`Could not scrape website ${url}`);

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

export const PTP2_LECTURE_NAME = "Theoretische Physik II";
export const PTP2_UPDATE = bot => async () => {
  const PTP2_URL_SUFFIX = "/vorlesung/20191/ptp2";

  let $ = await req(UEBUNGEN_PHYSIK_URL + PTP2_URL_SUFFIX)
    .then(res => cheerio.load(res.body))
    .catch(err => {
      log(ERROR)(err);
      return null;
    });
  // if $ is null (or undefined)
  if (!$) throw SCRAPE_ERROR(UEBUNGEN_PHYSIK_URL + PTP2_URL_SUFFIX);
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

export const PEP2_LECTURE_NAME = "Experimentalphysik II";
export const PEP2_UPDATE = bot => async () => {
  const PEP2_URL_SUFFIX = "/course/view.php?id=21423";
  const cookieJar = await moodle_login();
  const $ = await req(MOODLE_URL + PEP2_URL_SUFFIX, {
    jar: cookieJar
  })
    .then(res => cheerio.load(res.body))
    .catch(err => {
      log(ERROR)(err);
      return null;
    });
  // if $ is null (or undefined)
  if (!$) throw SCRAPE_ERROR(MOODLE_URL + PEP2_URL_SUFFIX);
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
  //handleUpdate(bot)(PEP2_LECTURE_NAME, scrape);
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
  // if $ is null (or undefined)
  if (!$) throw SCRAPE_ERROR(MATHI_UNI_HD_URL + ANA2_URL_SUFFIX);
  const scrape = $(
    "#MainColumn > table > tbody > tr > td > table:nth-child(15) > tbody > tr:nth-child(2) > td > table > tbody"
  )
    .find("li")
    .map((i, el) => {
      // https://github.com/ekzyis/physicsbot/issues/24
      let text = "";
      let type = $(el).contents()[0].type;
      if (type !== "text") {
        text = $(el)
          .contents()[0]
          .children.find(el => el.type === "text")
          .data.trim();
      } else {
        text = $(el)
          .contents()[0]
          .data.trim();
      }
      let embedded_href = "";
      let hreftext = $(el)
        .find("a")
        .text();
      if (hreftext !== "(pdf)") {
        embedded_href = $(el)
          .children("a")[1]
          .attribs.href.slice(2);
      } else {
        embedded_href = $(el)
          .find("a")
          .attr("href")
          .slice(2);
      }
      let href =
        MATHI_UNI_HD_URL +
        ANA2_URL_SUFFIX.replace("ana2.html", "") +
        embedded_href;
      return { text, href };
    })
    .get();
  //handleUpdate(bot)(ANA2_LECTURE_NAME, scrape);
};
