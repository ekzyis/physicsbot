import mongoose from "mongoose";
import { dbLogger, log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import {
  ANA1_LECTURE_NAME,
  ANA2_LECTURE_NAME,
  PEP1_LECTURE_NAME,
  PEP2_LECTURE_NAME,
  PEP3_LECTURE_NAME,
  PTP1_LECTURE_NAME,
  PTP2_LECTURE_NAME
} from "./scrape/scrape";

const { ERROR, DB } = TYPE;

const createDocument = (Model, data) => {
  dbLogger.info(`Creating new document (${Model.modelName})`);
  let model = new Model(data);
  return new Promise((resolve, reject) => {
    model.save((err, doc) => {
      if (err) return reject(err);
      resolve(doc);
    });
  });
};

// Creates a document with specified identifier else creates it with specified data
const initDocument = (Model, identifier, data) => {
  return new Promise((resolve, reject) => {
    Model.countDocuments(identifier, (err, count) => {
      if (err) reject(err);
      if (count === 0) {
        createDocument(Model, data)
          .then(resolve)
          .catch(reject);
      } else {
        resolve();
      }
    });
  });
};

export const connect = ADDRESS => {
  mongoose.connect(
    ADDRESS,
    {
      useNewUrlParser: true
    }
  );

  const db = mongoose.connection;

  db.on("error", dbLogger.error);
  db.once("open", () => dbLogger.info(`Database connection successful!`));

  return db;
};

export const initDatabase = bot => {
  // TODO make creating of this object obsolete
  // TODO get color from config
  let initDocumentProps = [
    {
      name: PTP1_LECTURE_NAME,
      roleNameMapIdentifier: "Theoretische Physik",
      color: "#29ca62"
    },
    {
      name: ANA1_LECTURE_NAME,
      roleNameMapIdentifier: "Analysis",
      color: "#e2ff08"
    },
    {
      name: PEP1_LECTURE_NAME,
      roleNameMapIdentifier: "Experimentalphysik",
      color: "#df22d3"
    },
    {
      name: PEP3_LECTURE_NAME,
      roleNameMapIdentifier: "Experimentalphysik 3",
      color: "#df22d3"
    }
  ];

  return Promise.all(
    initDocumentProps.map(({ name, roleNameMapIdentifier, color }) => {
      return new Promise((resolve, reject) => {
        let channel = undefined;
        const mapEntry = bot.roleNameMap.get(roleNameMapIdentifier);
        if (mapEntry && mapEntry.channel) channel = mapEntry.channel.id;
        else if (process.env.NODE_ENV === "development")
          channel = bot.config.channel.dev.id;
        if (!channel) {
          return reject(new Error(`No channel defined for lecture ${name}!`));
        }
        return initDocument(
          Lecture,
          { name },
          {
            name,
            channel,
            color
          }
        )
          .then(resolve)
          .catch(dbLogger.error);
      }).catch(dbLogger.error);
    })
  );
};
