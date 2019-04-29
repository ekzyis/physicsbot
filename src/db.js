import mongoose from "mongoose";
import { log, TYPE } from "./util";
import Lecture from "./model/Lectures";
import { PEP2_LECTURE_NAME } from "./update/pep2";

const { ERROR, DB } = TYPE;

const createDocument = (Model, data) => {
  log(DB)(`Creating new document (${Model.modelName})`);
  let model = new Model(data);
  return model.save();
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

  // Initialize documents
  Lecture.countDocuments({ name: PEP2_LECTURE_NAME }, (err, count) => {
    if (err) throw err;
    if (count === 0) {
      return createDocument(Lecture, {
        name: PEP2_LECTURE_NAME,
        // TODO get this from config instead of hardcoding
        channel: "506552477542383627",
        color: "#29ca62"
      });
    }
  });

  return db;
};
