import fs from "fs";
import { log, TYPE } from "./util";
// prettier-ignore
const { GENERAL, SEND_MESSAGE, EDIT, ERROR } = TYPE;
import {
  getAnalysisData,
  getExpData,
  getLineareAlgebraData,
  getTheoData
} from "./scrape";
import discord from "discord.js";

export const getServer = client => {
  let serverData = JSON.parse(fs.readFileSync("exclude/server.json", "utf8"));
  let server = serverData[process.env.NODE_ENV];
  server.guild = client.guilds.get(server.id);
  server.defaultChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "default").id
  );
  server.rulesChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "rules").id
  );
  server.overviewChannel = server.guild.channels.get(
    server.channels.find(item => item.name === "overview").id
  );
  return server;
};

export const getRoles = server => {
  let roles = {};
  roles.mapper = new Map();
  // populate mapper with given role and emoji IDs and if exists, channel
  server.roles.forEach(item => {
    if (item.emoji) {
      // NOTE we assume that every item with props emoji also has props role
      let value = {
        role: server.guild.roles.get(item.role.id),
        emoji: server.guild.emojis.get(item.emoji.id)
      };
      if (!!item.channel) {
        value.channel = server.guild.channels.get(item.channel.id);
      }
      roles.mapper.set(item.name, value);
      log(GENERAL)(
        `role name: ${item.name}, role id: ${item.role.id}, emoji id: ${
          item.emoji.id
        }, channel id: ${!!item.channel ? item.channel.id : undefined}`
      );
    }
  });
  let emojiString = "";
  roles.mapper.forEach(value => {
    emojiString += `${value.role.toString()}: ${value.emoji.toString()}\n\n`;
  });
  roles.embed = {
    title: `***Rollen***`,
    description:
      `\nWillkommen im Rollen-Verteiler, hier könnt ihr auswählen was ihr studiert ` +
      `und welche Kurse ihr belegt in dem ihr entsprechend auf diese Nachricht *reagiert*.\n\n` +
      `Das ganze dient zur Übersicht und schaltet nur für die einzelnen Kurse bestimmte Text[- und Sprach]kanäle ` +
      `frei, die ihr jetzt noch nicht sehen könnt.\n\n` +
      `Reagieren ist ganz einfach: Klickt einfach auf die einzelnen Symbole unter diesem Post. ` +
      `Dadurch erscheinen neue Textkanäle, in denen du dich mit deinen Kommilitonen austauschen kannst.\n` +
      `Dies ist auch reversibel. Ihr könnt hier auch eine Reaktion durch einfaches Klicken wieder entfernen, ` +
      `um z.B. über LA oder ANA nicht mehr informiert zu werden, bzw. diese Kanäle nicht mehr zu sehen.\n\n` +
      `Probiert es ruhig aus, ihr könnt nichts falsch machen, nichts ist in Stein gemeißelt. Bei Fragen sind alle in der <#` +
      server.defaultChannel.id +
      `> sehr hilfsbereit!\n\n` +
      `${emojiString}`,
    id: undefined
  };
  return roles;
};

export const getLectures = async mapper => {
  let lectures = {
    algebra: {},
    analysis: {},
    exp: {},
    theo: {}
  };
  // Lineare Algebra embed
  lectures.algebra.name = "Lineare Algebra";
  lectures.algebra.fields = await getLineareAlgebraData();
  lectures.algebra.updater = getLineareAlgebraData;
  lectures.algebra.embed = {
    title: `${
      mapper.get("Lineare Algebra").emoji
    }  ***Vorlesungsübersicht für Lineare Algebra***`,
    fields: lectures.algebra.fields,
    color: 0x1be0ec,
    id: undefined
  };
  // Analysis embed
  lectures.analysis.name = "Analysis";
  lectures.analysis.fields = await getAnalysisData();
  lectures.analysis.updater = getAnalysisData;
  lectures.analysis.embed = {
    title: `${
      mapper.get("Analysis").emoji
    }  ***Vorlesungsübersicht für Analysis***`,
    fields: lectures.analysis.fields,
    color: 0xcfdb15,
    id: undefined
  };
  // Experimentalphysik embed
  lectures.exp.name = "Experimentalphysik";
  lectures.exp.fields = await getExpData();
  lectures.exp.updater = getExpData;
  lectures.exp.embed = {
    title: `${
      mapper.get("Experimentalphysik").emoji
    }  ***Vorlesungsübersicht für Experimentalphysik I***`,
    fields: lectures.exp.fields,
    color: 0xf31be6,
    id: undefined
  };
  // Theoretische Physik embed
  lectures.theo.name = "Theoretische Physik";
  lectures.theo.fields = await getTheoData();
  lectures.theo.updater = getTheoData;
  lectures.theo.embed = {
    title: `${
      mapper.get("Theoretische Physik").emoji
    }  ***Vorlesungsübersicht für Theoretische Physik I***`,
    fields: lectures.theo.fields,
    color: 0x2be07c,
    id: undefined
  };
  return lectures;
};

export const init_overviewChannel = (
  overviewChannel,
  rolesEmbed,
  rolesMapper,
  lectures
) => {
  // Check if there is already a roles embed in overview channel
  init_embed(overviewChannel, rolesEmbed).finally(() => {
    // React with emotes so users can just click on them
    overviewChannel
      .fetchMessage(rolesEmbed.id)
      .then(message => {
        rolesMapper.forEach(value => {
          message.react(value.emoji).catch(log(ERROR));
        });
      })
      .catch(log(ERROR));
  });
  Promise.all(
    Object.keys(lectures).map(key =>
      init_embed(overviewChannel, lectures[key].embed)
    )
  ).then(
    setInterval(
      () =>
        Object.keys(lectures).forEach(key =>
          updateLecture(overviewChannel, rolesMapper, lectures[key])
        ),
      5000 * 60 // 5 seconds * 60 = 5 minutes //
    )
  );
};

const updateLecture = async (overviewChannel, mapper, lec) => {
  let newFields = await lec.updater();
  // NOTE We ignore elements which old data contains but new data not!
  let diff = newFields.filter(obj => {
    // Get elements which are not included in old data
    return !lec.fields.some(obj2 => {
      return obj.value === obj2.value;
    });
  });
  // If object is not empty, update embed
  if (!!Object.keys(diff).length) {
    log(GENERAL)(`Updated needed for ${lec.embed.title}! Editing embed...`);
    lec.fields = newFields;
    lec.embed = {
      ...lec.embed,
      fields: newFields
    };
    edit_embed(overviewChannel, lec.embed.id, lec.embed).then(() => {
      let channel = mapper.get(lec.name).channel;
      // NOTE mentioning of roles disabled for the time being
      //let role = roles.mapper.get(lec.name).role;
      // NOTE why is channel.send(string, embed) showing warning about "params don't match"?
      // https://discord.js.org/#/docs/main/stable/class/TextChannel?scrollTo=send
      channel
        .send(`${overviewChannel.toString()} aktualisiert mit:`, {
          embed: new discord.RichEmbed({
            ...lec.embed,
            title: `${lec.embed.title} (nur aktualisierte Links)`,
            fields: Object.values(diff)
          })
        })
        .then(log(SEND_MESSAGE))
        .catch(log(ERROR));
    });
  }
};

const edit_embed = (channel, id, updatedEmbed) => {
  return channel
    .fetchMessage(id)
    .then(fetched => {
      fetched
        .edit(
          new discord.RichEmbed({
            ...updatedEmbed
          })
        )
        .then(log(EDIT));
    })
    .catch(log(ERROR));
};

const init_embed = (channel, embed) => {
  // look if embed already exists
  return find_embed(channel, embed.title)
    .then(id => {
      log(GENERAL)(`Found embed for ${embed.title} - id: ${id}`);
      embed.id = id;
    })
    .catch(() => {
      // if not, create it
      return channel
        .send(
          new discord.RichEmbed({
            ...embed
          })
        )
        .then(msg => {
          log(GENERAL)(
            `Successfully sent embed for ${embed.title} - id: ${msg.id}`
          );
          log(SEND_MESSAGE)(msg);
          embed.id = msg.id;
        })
        .catch(log(ERROR));
    });
};

// Resolve id of message when found else reject with message "Message not found" ¯\_(ツ)_/¯
export const find_embed = (channel, title) => {
  // NOTE we assume there are only FETCH_LIMIT messages in overview channel!
  return channel.fetchMessages({ limit: FETCH_LIMIT }).then(messages => {
    return new Promise(function(resolve, reject) {
      messages.array().forEach(msg => {
        if (msg.embeds.some(embed => embed.title === title)) {
          resolve(msg.id);
        }
      });
      reject("Message not found ¯\\_(ツ)_/¯");
    });
  });
};
