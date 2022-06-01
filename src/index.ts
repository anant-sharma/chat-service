/**
 * Module Dependencies
 */
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server as HttpServer } from "http";
import { Config } from "./config";
import router from "./routes";
import { Server as InternalSocketServer } from "./controllers/Socket";
import { Logger } from "./utilities/logger";
import { DataSource } from "./datasource";
// import storageRouter from "./routes/storage";
// import { authVerify } from "./routes/auth/verify";

const initAppServer = () => {
  const app = express();

  const httpServer = new HttpServer(app);
  InternalSocketServer.Init(httpServer);

  /**
   * App Middlewares
   */
  app.use(morgan("dev"));
  app.use(cors());
  app.use(helmet());
  // app.use("/storage", authVerify, storageRouter);
  app.use(express.json({ limit: 524288000 }));
  app.use(express.urlencoded({ extended: true, limit: 524288000 }));

  app.use(router);

  httpServer.listen(Number(Config.Get("PORT")), () => {
    console.info(`[*] Server Started on Port ${Config.Get("PORT")}`);
  });
};

const init = () => {
  Config.Init();
  Logger.Init();
  DataSource.Init();
  initAppServer();
};
init();
