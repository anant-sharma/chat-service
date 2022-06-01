import { model, Schema } from "mongoose";

const schema = new Schema<any>({
  token: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  response: {},
  data: {},
  payload: {},
});

export const NotificationModel = model<any>("Notification", schema);
export const SilentNotificationModel = model<any>("SilentNotification", schema);
