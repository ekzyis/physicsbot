const request = require("request");
const cheerio = require("cheerio");

const LINEARE_ALGEBRA_URL =
  "https://ssp.math.uni-heidelberg.de/la1-ws2018/uebung.html";

const ANALYSIS_URL =
  "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1.html";

const PEP1_URL =
  "https://uebungen.physik.uni-heidelberg.de/vorlesung/20182/pep1";

const PTP1_URL =
  "https://uebungen.physik.uni-heidelberg.de/vorlesung/20182/ptp1";

const getLineareAlgebraData = () => {
  return new Promise((resolve, reject) => {
    // TODO add reject / error checking
    request(LINEARE_ALGEBRA_URL, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        let $ = cheerio.load(html);
        // 0: abgabeblätter
        // 1: lösungen
        // 2: präsenzblätter
        // 3: lösungen
        let results = [[], [], [], [], []];
        $("div#content > table > tbody > tr").each((i, element) => {
          // get week string
          let week = $(element)
            .children()
            .eq(0)
            .text()
            .replace(/\s\s+/g, " ");
          results[0].push(week);
          for (let i = 1; i < 5; i++) {
            // get links
            let subelement = $(element)
              .children()
              .eq(i)
              .children("a");
            let link =
              // TODO replace hardcoded url
              "https://ssp.math.uni-heidelberg.de/la1-ws2018/" +
              $(subelement).attr("href");
            let text = $(subelement).text();
            results[i].push({
              text,
              link
            });
          }
        });
        // convert data into fields object which can be handled by discord.RichEmbed
        let fieldify = data => {
          let fields = [];
          for (let i = 0; i < data[0].length; ++i) {
            fields.push({
              name: data[0][i],
              value:
                `[${data[1][i].text}](${data[1][i].link}) ` +
                `[${data[2][i].text}](${data[2][i].link}) ` +
                `[${data[3][i].text}](${data[3][i].link}) ` +
                `[${data[4][i].text}](${data[4][i].link})`
            });
          }
          return fields;
        };
        resolve(fieldify(results));
      }
    });
  });
};

const getAnalysisData = () => {
  return new Promise((resolve, reject) => {
    // TODO add reject / error checking
    request(ANALYSIS_URL, (error, response, html) => {
      // server does not respond with status code even though successful...
      //console.log(response.status);
      if (!error) {
        let $ = cheerio.load(html);
        let results = [];
        // <tr>'s of table
        let table = $(
          "div#MainColumn > table.mathi > tbody > tr > td > table.mathi"
        )
          .eq(1)
          .children("tbody")
          .children("tr")
          .eq(7)
          .children("td")
          .children("table.mathi")
          .children("tbody")
          .children();
        table.each((i, row) => {
          // ignore first row
          if (i !== 0) {
            let cells = $(row).children();
            // first element is number of exercise
            results.push({
              text: `Blatt ${cells.eq(0).text()}`,
              link:
                // TODO replace hardcoded url
                "https://www.mathi.uni-heidelberg.de/~hofmann/files/" +
                cells
                  .eq(2)
                  .children("a")
                  .attr("href")
                  .substr(2)
            });
          }
        });
        let fieldify = data => {
          let fields = [];
          data.forEach(obj => {
            fields.push({
              name: obj.text,
              value: obj.link
            });
          });
          return fields;
        };
        resolve(fieldify(results));
      }
    });
  });
};

const getExpData = () => {
  return new Promise((resolve, reject) => {
    // TODO add reject / error checking
    request(PEP1_URL, (error, response, html) => {
      // server does not respond with status code even though successful...
      //console.log(response.status);
      if (!error) {
        let $ = cheerio.load(html);
        let results = [[], []];
        // Folien
        $("div#infoarea-4861 > div > div.picfileline").each((i, element) => {
          results[0].push({
            text: $(element)
              .children("a")
              .text(),
            link:
              // TODO replace hardcoded url
              "https://uebungen.physik.uni-heidelberg.de" +
              $(element)
                .children("a")
                .attr("href")
          });
        });
        // Übungsblätter
        $("div#infoarea-4862 > ul > li > ul > li").each((i, element) => {
          results[1].push({
            text: $(element).text(),
            link:
              // TODO replace hardcoded url
              "https://uebungen.physik.uni-heidelberg.de" +
              $(element)
                .contents("a")
                .attr("href")
          });
        });
        let fieldify = data => {
          let fields = [];
          data[0].forEach(obj =>
            fields.push({
              name: obj.text,
              value: obj.link
            })
          );
          data[1].forEach(obj => {
            fields.push({
              name: obj.text,
              value: obj.link
            });
          });
          return fields;
        };
        resolve(fieldify(results));
      }
    });
  });
};

const getTheoData = () => {
  return new Promise((resolve, reject) => {
    request(PTP1_URL, (error, response, html) => {
      // server does not respond with status code even though successful...
      //console.log(response.status);
      if (!error) {
        let $ = cheerio.load(html);
        let results = [];
        $("div#infoarea-5006 > ul > li > ul > li").each((i, element) => {
          results.push({
            text: $(element)
              .children("a")
              .text(),
            link:
              // TODO replace hardcoded url
              "https://uebungen.physik.uni-heidelberg.de" +
              $(element)
                .children("a")
                .attr("href")
          });
        });
        let fieldify = data => {
          let fields = [];
          data.forEach(obj => {
            fields.push({
              name: obj.text,
              value: obj.link
            });
          });
          return fields;
        };
        resolve(fieldify(results));
      }
    });
  });
};

module.exports = {
  getLineareAlgebraData,
  getAnalysisData,
  getExpData,
  getTheoData
};
