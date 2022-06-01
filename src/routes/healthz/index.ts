/**
 * Import Dependencies
 */
import express from "express";
import { Config } from "../../config";

/**
 * Initialize Router
 */
const router = express.Router();

/**
 * Bind Routes
 */
router.get("/", (_: express.Request, res: express.Response) => {
  res.status(200).json({
    app: Config.Get("APPNAME"),
    health: "OK",
  });
});

/**
 * Export Module
 */
export default router;
