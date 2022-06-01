import { model, Schema } from "mongoose";
import { IFile } from "../types";

const schema = new Schema<IFile>(
  {
    User: { type: String, required: true },
    Key: { type: String, required: true },
    Data: {},
  },
  {
    timestamps: true,
  }
);

export const FileModel = model<IFile>("File", schema);
