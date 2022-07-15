/**
 * Import Dependencies
 */
import express from "express";
import { MessageController } from "../../controllers/Message";
import { Server as SocketServer } from "../../controllers/Socket";
import { SSO } from "../../third-party/sso";
import { extractToken } from "../auth/verify";

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
        data: availabilityMap,
      });
    } catch (e) {
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.get(
  "/interactions",
  async (req: express.Request, res: express.Response) => {
    const { limit = 1 } = req.query;
    const token = extractToken(req) ?? "";
    const user = await SSO.GetUser(token);

    try {
      const lastInteractions = await MessageController.GetAllLastInteractions(
        user.Email,
        token,
        +limit
      );

      res.status(200).json({
        data: lastInteractions,
      });
    } catch (e) {
      console.error(e);
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.get(
  "/messages/:recipient",
  async (req: express.Request, res: express.Response) => {
    const user = await SSO.GetUser(extractToken(req) ?? "");
    const { recipient } = req.params;

    const { page = 1, limit = 10 }: Partial<{ page: number; limit: number }> =
      req.query;

    try {
      const messages = await MessageController.Get({
        sender: user.Email,
        recipient,
        page,
        limit,
      });
      res.status(200).json({
        data: messages,
      });
    } catch (e) {
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.delete(
  "/messages",
  async (req: express.Request, res: express.Response) => {
    const user = await SSO.GetUser(extractToken(req) ?? "");

    const { Identifiers = [] }: { Identifiers: string[] } = req.body;

    try {
      await MessageController.BulkDelete(user.Email, Identifiers);
      res.status(200).json({});
    } catch (e) {
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.delete("/all", async (req: express.Request, res: express.Response) => {
  const user = await SSO.GetUser(extractToken(req) ?? "");

  try {
    await MessageController.DeleteAll(user.Email);
    res.status(200).json({});
  } catch (e) {
    res.status(400).json({
      message: e,
    });
  }
});

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
        data: newMessage,
      });
    } catch (e) {
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.post(
  "/events/:event",
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await SSO.GetUser(extractToken(req) ?? "");
      const From = user.Email;
      const Type = req.params.event || "";
      const newMessage = await MessageController.MarkUserAction({
        ...req.body,
        From,
        Type,
      });

      res.status(200).json({
        data: newMessage,
      });
    } catch (e) {
      res.status(400).json({
        message: e,
      });
    }
  }
);

router.get("/:id/info", async (req: express.Request, res: express.Response) => {
  try {
    const user = await SSO.GetUserInfo(req.params.id, extractToken(req) ?? "");
    res.status(200).json({
      data: {
        Name: user.Name,
        Email: user.Email,
        AvatarURL: user.AvatarURL,
      },
    });
  } catch (e) {
    res.status(400).json({
      message: e,
    });
  }
});

/**
 * Export Module
 */
export default router;
