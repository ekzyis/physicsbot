import mongoose from "mongoose";
import { log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import {
  ANA2_LECTURE_NAME,
  PEP2_LECTURE_NAME,
  PTP2_LECTURE_NAME
} from "./scrape";

const { ERROR, DB } = TYPE;

const createDocument = (Model, data) => {
  log(DB)(`Creating new document (${Model.modelName})`);
  let model = new Model(data);
  return model.save();
};

const initDocument = (Model, identifier, data) => {
  Model.countDocuments(identifier, (err, count) => {
    if (err) throw err;
    if (count === 0) return createDocument(Model, data);
  });
};

export const connect = bot => ADDRESS => {
  mongoose.connect(
    ADDRESS,
    {
      useNewUrlParser: true
    }
  );

  const db = mongoose.connection;

  db.on("error", log(ERROR));
  db.once("open", () => log(DB)(`Database connection successful!`));

  // Initialize documents

  initDocument(
    Lecture,
    { name: PTP2_LECTURE_NAME },
    {
      name: PTP2_LECTURE_NAME,
      channel: bot.roleNameMap.get("Theoretische Physik 2").channel.id,
      // TODO get from config
      color: "#29ca62"
    }
  );
  initDocument(
    Lecture,
    { name: PEP2_LECTURE_NAME },
    {
      name: PEP2_LECTURE_NAME,
      channel: bot.roleNameMap.get("Experimentalphysik 2").channel.id,
      // TODO get from config
      color: "#df22d3"
    }
  );
  initDocument(
    Lecture,
    { name: ANA2_LECTURE_NAME },
    {
      name: ANA2_LECTURE_NAME,
      channel: bot.roleNameMap.get("Analysis 2").channel.id,
      // TODO get from config
      color: "#6d602e"
    }
  );

  return db;
};
