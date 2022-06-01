/**
 * Import Dependencies
 */
import express from "express";
import { MessageController } from "../../controllers/Message";
import { Server as SocketServer } from "../../controllers/Socket";

/**
 * Initialize Router
 */
const router = express.Router();

/**
 *Bind Routes
 */
router.post(
  "/availability-status",
  async (req: express.Request, res: express.Response) => {
    const { users = [] } = req.body;

    try {
      const availabilityMap: { [key: string]: boolean } = {};
      for (const user of users) {
        availabilityMap[user] = await SocketServer.getAvailability(user);
      }

      res.status(200).json({
        status: true,
        message: "",
        data: availabilityMap,
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: {},
      });
    }
  }
);

router.get(
  "/:user/interactions",
  async (req: express.Request, res: express.Response) => {
    const { user = "" } = req.params;
    const { limit = 1 } = req.query;

    try {
      const lastInteractions = await MessageController.GetAllLastInteractions(
        user,
        +limit
      );

      res.status(200).json({
        status: true,
        message: "",
        data: lastInteractions,
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: [],
      });
    }
  }
);

router.get(
  "/:sender/messages/:recipient",
  async (req: express.Request, res: express.Response) => {
    const { sender, recipient } = req.params;

    const { page = 1, limit = 10 }: Partial<{ page: number; limit: number }> =
      req.query;

    try {
      const messages = await MessageController.Get({
        sender,
        recipient,
        page,
        limit,
      });
      res.status(200).json({
        status: true,
        message: "",
        data: messages,
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: [],
      });
    }
  }
);

router.delete(
  "/:sender/messages",
  async (req: express.Request, res: express.Response) => {
    const { sender = "" } = req.params;

    const { Identifiers = [] }: { Identifiers: string[] } = req.body;

    try {
      await MessageController.BulkDelete(sender, Identifiers);
      res.status(200).json({
        status: true,
        message: "",
        data: {},
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: {},
      });
    }
  }
);

router.delete(
  "/:user/all",
  async (req: express.Request, res: express.Response) => {
    const { user = "" } = req.params;

    try {
      await MessageController.DeleteAll(user);
      res.status(200).json({
        status: true,
        message: "",
        data: {},
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: null,
      });
    }
  }
);

router.post(
  "/:user/interactions/add",
  async (req: express.Request, res: express.Response) => {
    const From = req.params.user || "";
    const { To = "", Type = "", Data = {} } = req.body;

    try {
      const newMessage = await MessageController.AddInteraction({
        To,
        From,
        Type,
        Data,
      });

      res.status(200).json({
        status: true,
        message: "",
        data: newMessage,
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: {},
      });
    }
  }
);

router.post(
  "/:user/events/:event",
  async (req: express.Request, res: express.Response) => {
    try {
      const From = req.params.user || "";
      const Type = req.params.event || "";
      const newMessage = await MessageController.MarkUserAction({
        ...req.body,
        From,
        Type,
      });

      res.status(200).json({
        status: true,
        message: "",
        data: newMessage,
      });
    } catch (e) {
      res.status(400).json({
        status: false,
        message: e,
        data: {},
      });
    }
  }
);

/**
 * Export Module
 */
export default router;
