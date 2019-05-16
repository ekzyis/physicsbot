import mongoose from "mongoose";

const LectureSchema = mongoose.Schema(
  {
    channel: { type: String, default: null },
    name: { type: String, default: null },
    color: { type: String, default: null },
    updates: [
      {
        time: { type: Date, default: null },
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
