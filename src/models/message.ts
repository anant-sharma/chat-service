import { model, Schema } from "mongoose";
import { IMessage } from "../types";

const schema = new Schema<IMessage<any>>({
  Identifier: { type: String, required: true },
  Type: { type: String, required: true },
  From: { type: String, required: true },
  To: { type: String, required: true },
  Timestamp: { type: Date, default: Date.now },
  Status: { type: String, required: true },
  DeletedBy: { type: [String], default: [] },
  Data: {},
});

export const MessageModel = model<IMessage<any>>("Message", schema);
