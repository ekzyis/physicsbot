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

const analysisOld = [
  {
    name: "Blatt 1",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt01.pdf"
  },
  {
    name: "Blatt 2",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt02.pdf"
  },
  {
    name: "Blatt 3",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt03.pdf"
  },
  {
    name: "Blatt 4",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt04.pdf"
  },
  {
    name: "Blatt 5",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt05.pdf"
  },
  {
    name: "Blatt 6",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt06.pdf"
  },
  {
    name: "Blatt 7",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt07.pdf"
  },
  {
    name: "Blatt 8",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt08.pdf"
  },
  {
    name: "Blatt 9",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt09.pdf"
  },
  {
    name: "Blatt 10",
    value:
      "https://www.mathi.uni-heidelberg.de/~hofmann/files/ana1/zettel/blatt10.pdf"
  }
];

const expOld = [
  {
    name: "Folien_1.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_1.pdf"
  },
  {
    name: "Folien_2.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_2.pdf"
  },
  {
    name: "Folien_3.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_3.pdf"
  },
  {
    name: "Folien_4.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_4.pdf"
  },
  {
    name: "Folien_5.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_5.pdf"
  },
  {
    name: "Folien_6.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_6.pdf"
  },
  {
    name: "Folien_7.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_7.pdf"
  },
  {
    name: "Folien_8.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/c/image/d/vorlesung/20182/908/material/Folien_8.pdf"
  },
  {
    name: "PEP1_WS18_Blatt01.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3215/PEP1_WS18_Blatt01.pdf"
  },
  {
    name: "PEP1_WS18_Blatt02..pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3256/PEP1_WS18_Blatt02..pdf"
  },
  {
    name: "PEP1_WS18_Blatt03.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3295/PEP1_WS18_Blatt03.pdf"
  },
  {
    name: "PEP1_WS18_Blatt04.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3315/PEP1_WS18_Blatt04.pdf"
  },
  {
    name: "PEP1_WS18_Blatt05.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3354/PEP1_WS18_Blatt05.pdf"
  },
  {
    name: "PEP1_WS18_Blatt06.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3382/PEP1_WS18_Blatt06.pdf"
  },
  {
    name: "PEP1_WS18_Blatt07.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3412/PEP1_WS18_Blatt07.pdf"
  },
  {
    name: "PEP1_WS18_Blatt08.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3439/PEP1_WS18_Blatt08.pdf"
  },
  {
    name: "PEP1_WS18_Blatt09.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3468/PEP1_WS18_Blatt09.pdf"
  },
  {
    name: "PEP1_WS18_Blatt10.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3501/PEP1_WS18_Blatt10.pdf"
  }
];

const algebraOld = [
  {
    name: "Woche 1 (15.10. - 19.10.)",
    value:
      "[Abgabeblatt 1](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt01.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt01loesung.pdf) [Präsenzblatt 1](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt01.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt01loesung.pdf)"
  },
  {
    name: "Woche 2 (22.10. - 26.10.)",
    value:
      "[Abgabeblatt 2](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt02.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt02loesung.pdf) [Präsenzblatt 2](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt02.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt02loesung.pdf)"
  },
  {
    name: "Woche 3 (29.10. - 02.11.)",
    value:
      "[Abgabeblatt 3](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt03.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt03loesung.pdf) [Präsenzblatt 3](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt03.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt03loesung.pdf)"
  },
  {
    name: "Woche 4 (05.11. - 09.11.)",
    value:
      "[Abgabeblatt 4](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt04.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt04loesung.pdf) [Präsenzblatt 4](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt04.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt04loesung.pdf)"
  },
  {
    name: "Woche 5 (12.11. - 16.11.)",
    value:
      "[Abgabeblatt 5](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt05.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt05loesung.pdf) [Präsenzblatt 5](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt05.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt05loesung.pdf)"
  },
  {
    name: "Woche 6 (19.11. - 23.11.)",
    value:
      "[Abgabeblatt 6](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt06.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt06loesung.pdf) [Präsenzblatt 6](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt06.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt06loesung.pdf)"
  },
  {
    name: "Woche 7 (26.11. - 30.11.)",
    value:
      "[Abgabeblatt 7](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt07.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt07loesung.pdf) [Präsenzblatt 7](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt07.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt07loesung.pdf)"
  },
  {
    name: "Woche 8 (03.12. - 7.12.)",
    value:
      "[Abgabeblatt 8](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt08.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt08loesung.pdf) [Präsenzblatt 8](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt08.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt08loesung.pdf)"
  },
  {
    name: "Woche 9 (10.12. - 14.12.)",
    value:
      "[Abgabeblatt 9](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt09.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt09loesung.pdf) [Präsenzblatt 9](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt09.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt09loesung.pdf)"
  },
  {
    name: "Woche 10 (17.12. - 21.12.)",
    value:
      "[Abgabeblatt 10](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/abgabeblatt10.pdf) [](https://ssp.math.uni-heidelberg.de/la1-ws2018/undefined) [Präsenzblatt 10](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt10.pdf) [Lösung](https://ssp.math.uni-heidelberg.de/la1-ws2018/uebungen/praesenzblatt10loesung.pdf)"
  }
];

const theoOld = [
  {
    name: "praesenz01.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3209/p01.pdf"
  },
  {
    name: "praesenz02.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3232/p02.pdf"
  },
  {
    name: "uebung01.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3233/blatt01.pdf"
  },
  {
    name: "uebung02.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3273/blatt02.pdf"
  },
  {
    name: "uebung03.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3303/blatt03.pdf"
  },
  {
    name: "uebung04.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3331/blatt04.pdf"
  },
  {
    name: "uebung05.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3368/blatt05.pdf"
  },
  {
    name: "uebung06.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3393/blatt06.pdf"
  },
  {
    name: "uebung07.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3449/blatt07.pdf"
  },
  {
    name: "uebung08.pdf",
    value:
      "https://uebungen.physik.uni-heidelberg.de/uebungen/download/3483/blatt08.pdf"
  }
];

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
  getTheoData,
  theoOld,
  algebraOld,
  analysisOld,
  expOld
};
