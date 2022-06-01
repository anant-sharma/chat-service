/**
 * Import Dependencies
 */
import express from "express";
import { Config } from "../../config";
import { JWT } from "../../utilities/jwt";

/**
 * Initialize Router
 */
const router = express.Router();

/**
 * Bind Routes
 */
router.get("/:userId", (req: express.Request, res: express.Response) => {
  const { userId } = req.params;
  res.status(200).json({
    token: JWT.sign({ userId }),
  });
});

/**
 * Export Module
 */
export default router;
