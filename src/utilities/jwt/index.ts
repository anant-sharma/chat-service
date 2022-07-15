import jwt from "jsonwebtoken";
import { Config } from "../../config";
import { JWTPayload } from "../../types";

export class JWT {
  public static async verify(token: string): Promise<boolean> {
    try {
      jwt.verify(token, Config.Get("JWT_SECRET"));
      return true;
    } catch (_) {
      return false;
    }
  }

  public static async decode(token: string): Promise<JWTPayload> {
    return jwt.verify(token, Config.Get("JWT_SECRET")) as JWTPayload;
  }

  public static sign(payload: JWTPayload) {
    return jwt.sign(payload, Config.Get("JWT_SECRET"));
  }
}
