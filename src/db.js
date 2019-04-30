import mongoose from "mongoose";
import { log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import { PEP2_LECTURE_NAME, PTP2_LECTURE_NAME } from "./scrape";

const { ERROR, DB } = TYPE;

const createDocument = (Model, data) => {
  log(DB)(`Creating new document (${Model.modelName})`);
  let model = new Model(data);
  return model.save();
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
  Lecture.countDocuments({ name: PTP2_LECTURE_NAME }, (err, count) => {
    if (err) throw err;
    if (count === 0) {
      return createDocument(Lecture, {
        name: PTP2_LECTURE_NAME,
        channel: bot.roleNameMap.get("Theoretische Physik 2").channel.id,
        // TODO get from config
        color: "#29ca62"
      });
    }
  });
  Lecture.countDocuments({ name: PEP2_LECTURE_NAME }, (err, count) => {
    if (err) throw err;
    if (count === 0) {
      return createDocument(Lecture, {
        name: PEP2_LECTURE_NAME,
        channel: bot.roleNameMap.get("Experimentalphysik 2").channel.id,
        // TODO get from config
        color: "#df22d3"
      });
    }
  });

  return db;
};
