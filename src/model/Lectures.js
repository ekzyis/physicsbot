import mongoose from "mongoose";

const LectureSchema = mongoose.Schema(
  {
    channel: { type: String, default: null },
    name: { type: String, default: null },
    color: { type: String, default: null },
    updates: [
      {
        // FIXME date is not set to date of insertion, but of code compilation!
        time: { type: Date, default: new Date().getUTCDate() },
        scrape: { type: [{}] },
        notification: {
          title: { type: String, default: null },
          description: { type: String, default: null }
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Lectures", LectureSchema);
