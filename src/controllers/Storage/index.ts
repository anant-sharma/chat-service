import { S3 } from "aws-sdk";
import { ManagedUpload } from "aws-sdk/clients/s3";
import { readFile, unlink } from "fs/promises";
import { Config } from "../../config";
import { FileModel } from "../../models/file";
import { IFile } from "../../types";

export class StorageController {
  private static s3: S3;

  public static Init() {
    this.s3 = new S3({
      accessKeyId: Config.Get("AMAZON_ACCESS_ID"),
      secretAccessKey: Config.Get("AMAZON_ACCESS_SECRET"),
    });

    this.createBucket();
  }

  public static UploadFile(
    folder: string,
    file: Express.Multer.File
  ): Promise<ManagedUpload.SendData> {
    return new Promise(async (resolve, reject) => {
      const fileContent = await readFile(file.path);

      const params: S3.PutObjectRequest = {
        Bucket: Config.Get("AMAZON_S3_BUCKET"),
        Key: `${folder}/${file.filename}`,
        Body: fileContent,
        Metadata: {
          OriginalName: file.originalname,
          MimeType: file.mimetype,
          Size: `${file.size}`,
        },
      };

      this.s3.upload(params, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          return reject(err);
        }

        resolve(data);
        this.deleteLocalFile(file);
      });
    });
  }

  public static GetFile(fileKey: string) {
    return this.s3
      .getObject({
        Bucket: Config.Get("AMAZON_S3_BUCKET"),
        Key: fileKey,
      })
      .createReadStream();
  }

  public static async StoreFileDetails(file: IFile) {
    return new FileModel(file).save();
  }

  public static async FetchFileDetails(
    user: string,
    key: string
  ): Promise<IFile | null> {
    return FileModel.findOne({
      User: user,
      Key: key,
    }).exec();
  }

  private static deleteLocalFile(file: Express.Multer.File) {
    return unlink(file.path).catch((_) => {});
  }

  private static createBucket() {
    this.s3.createBucket(
      {
        Bucket: Config.Get("AMAZON_S3_BUCKET"),
      },
      (err) => {
        if (err) {
          console.trace(err);
        }
      }
    );
  }
}
