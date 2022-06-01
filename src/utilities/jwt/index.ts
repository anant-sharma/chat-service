import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "../../config";

export class JWT {
  public static async verify(token: string): Promise<boolean> {
    try {
      jwt.verify(token, Config.Get("JWT_SECRET"));
      return true;
    } catch (_) {
      return false;
    }
  }

  public static async decode(token: string): Promise<JwtPayload> {
    return jwt.verify(token, Config.Get("JWT_SECRET")) as JwtPayload;
  }

  public static sign(payload: JwtPayload) {
    return jwt.sign(payload, Config.Get("JWT_SECRET"));
  }
}
