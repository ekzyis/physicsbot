import mongoose from "mongoose";

const LectureSchema = mongoose.Schema(
  {
    channel: { type: String, default: null },
    name: { type: String, default: null },
    color: { type: String, default: null },
    updates: [
      {
        // TODO Check if default value is really date of insertion and not time of compilation of this code
        time: { type: Date, default: new Date().getUTCDate() },
        scrape: { type: [{}] },
        notification: {
          title: { type: String, default: null },
          description: { type: String, default: null }
        },
        html: { type: String, default: null }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Lectures", LectureSchema);
