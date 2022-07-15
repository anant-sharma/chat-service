/**
 * Import Dependencies
 */
import express from "express";
import { authVerify } from "./auth/verify";

/**
 * Import Routes
 */
import healthzRouter from "./healthz";
import usersRouter from "./users";
import storageRouter from "./storage";

/**
 * Initialize Router
 */
const router = express.Router();

/**
 * Bind Routes
 */
router.use("/healthz", healthzRouter);
router.use("/users", authVerify, usersRouter);
router.use("/storage", authVerify, storageRouter);

/**
 * Export Module
 */
export default router;
