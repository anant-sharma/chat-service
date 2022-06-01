import mongoose from "mongoose";
import { Config } from "../config";

export class DataSource {
  public static Init() {
    mongoose.connect(Config.Get("MONGODB_CONN_STRING"));

    const db = mongoose.connection;
    db.on("error", (err: Error) => {
      console.error(`[*] Error connecting to datasource ${err}`);
      process.exit(-1);
    });
    db.once("open", function () {
      console.info("[*] Successfully connected to datasource!!");
    });
  }
}
