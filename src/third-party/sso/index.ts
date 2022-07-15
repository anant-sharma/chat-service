import { Config } from "../../config";
import { UserInfo } from "../../types";

export class SSO {
  private static registry = new Map<string, UserInfo>();
  private static userRegistry = new Map<string, UserInfo>();

  public static async GetUser(token: string): Promise<UserInfo> {
    const cachedInfo = SSO.registry.get(token);
    if (cachedInfo) {
      return cachedInfo;
    }

    return fetch(Config.Get("SSO_SERVICE") + "/api/v1/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user: UserInfo) => {
        SSO.registry.set(token, user);
        return user;
      });
  }

  public static async GetUserInfo(
    email: string,
    token: string
  ): Promise<UserInfo> {
    const cachedInfo = SSO.userRegistry.get(email);
    if (cachedInfo) {
      return cachedInfo;
    }

    return fetch(`${Config.Get("SSO_SERVICE")}/api/v1/user/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user: UserInfo) => {
        SSO.userRegistry.set(email, user);
        return user;
      });
  }
}
