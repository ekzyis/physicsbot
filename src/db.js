import mongoose from "mongoose";
import { log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import {
  ANA1_LECTURE_NAME,
  ANA2_LECTURE_NAME,
  PEP2_LECTURE_NAME,
  PTP1_LECTURE_NAME,
  PTP2_LECTURE_NAME
} from "./scrape";

const { ERROR, DB } = TYPE;

const createDocument = (Model, data) => {
  log(DB)(`Creating new document (${Model.modelName})`);
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

  db.on("error", log(ERROR));
  db.once("open", () => log(DB)(`Database connection successful!`));

  return db;
};

export const initDatabase = bot => {
  // TODO make creating of this object obsolete
  // TODO get color from config
  let initDocumentProps = [
    {
      name: PTP2_LECTURE_NAME,
      // the name property of this entity in the configuration file
      roleNameMapIdentifier: "Theoretische Physik 2",
      color: "#29ca62"
    },
    {
      name: PEP2_LECTURE_NAME,
      roleNameMapIdentifier: "Experimentalphysik 2",
      color: "#df22d3"
    },
    {
      name: ANA2_LECTURE_NAME,
      roleNameMapIdentifier: "Analysis 2",
      color: "#6d602e"
    },
    {
      name: PTP1_LECTURE_NAME,
      roleNameMapIdentifier: "Theoretische Physik",
      color: "#29ca62"
    },
    {
      name: ANA1_LECTURE_NAME,
      roleNameMapIdentifier: "Analysis",
      color: "#e2ff08"
    }
  ];

  return Promise.all(
    initDocumentProps.map(({ name, roleNameMapIdentifier, color }) => {
      return new Promise((resolve, reject) => {
        initDocument(
          Lecture,
          { name },
          {
            name,
            channel: bot.roleNameMap.get(roleNameMapIdentifier).channel.id,
            color
          }
        )
          .then(resolve)
          .catch(reject);
      });
    })
  );
};
