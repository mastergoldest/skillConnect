
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Message content is required."],
      trim: true,
      minlength: 1,
      maxlength: 3000,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ connection: 1, createdAt: 1 });

messageSchema.index({ connection: 1, sender: 1, readAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
