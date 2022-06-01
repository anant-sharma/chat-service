/**
 * Import Dependencies
 */
import express from "express";
import multer from "multer";
import { StorageController } from "../../controllers/Storage";

const upload = multer({
  dest: "uploads/",
  preservePath: true,
});

/**
 * Initialize Router
 */
const router = express.Router();

/**
 *Bind Routes
 */
router.get(
  "/:user/:key",
  async (
    req: express.Request<{ user: string; key: string }>,
    res: express.Response
  ) => {
    const { user, key } = req.params;

    res.setHeader("Content-disposition", `attachment; filename=${key}`);

    const fileDetails = await StorageController.FetchFileDetails(user, key);
    if (fileDetails) {
      res.setHeader(
        "Content-disposition",
        `attachment; filename=${fileDetails.Data.originalname}`
      );
      res.writeHead(200, { "Content-Type": fileDetails.Data.mimetype });
      res.flushHeaders();
    }

    const stream = StorageController.GetFile(`${user}/${key}`);
    stream.on("close", () => {
      res.end();
    });
    stream.pipe(res);
  }
);

router.post(
  "/:user/",
  upload.single("media"),
  async (req: express.Request<{ user: string }>, res: express.Response) => {
    try {
      const media = req.file;
      const { user } = req.params;

      if (!media) {
        res.status(400).json({
          error: new Error("Please provide media file!!"),
        });
        return;
      }

      StorageController.StoreFileDetails({
        User: user,
        Key: media.filename,
        Data: media,
      });
      const s3Media = await StorageController.UploadFile(user, media);
      res.status(200).json({
        status: true,
        message: "",
        data: {
          ...s3Media,
          Size: media.size,
        },
      });
    } catch (e) {
      res.status(200).json({
        status: false,
        message: e,
        data: null,
      });
    }
  }
);

/**
 * Export Module
 */
export default router;
