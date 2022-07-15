import { MESSAGE_TYPE } from "../../constants";
import { SSO } from "../../third-party/sso";
import { IGeo, IMedia, IMessage, IText, IUserAction } from "../../types";
import { Messenger } from "./messenger";

export class User {
  private userId: string = "";

  constructor(private socket: any) {
    this.addUserToRoom();
  }

  async getUserId(): Promise<string> {
    const isDebug = this.socket.handshake?.auth?.isDebug ?? false;
    if (isDebug) {
      return "test-user";
    }

    const token = this.socket.handshake?.auth?.token;
    const user = await SSO.GetUser(token);
    return user.Email;
  }

  async establishExchange() {
    const messenger = new Messenger(this.socket, await this.getUserId());

    this.socket.on(
      MESSAGE_TYPE.TEXT,
      (message: IMessage<IText>, cb: (_: IMessage<IText>) => {}) =>
        messenger.HandleMessage<IText>(
          { ...message, Type: MESSAGE_TYPE.TEXT },
          cb
        )
    );
    this.socket.on(
      MESSAGE_TYPE.MEDIA,
      (message: IMessage<IMedia>, cb: (_: IMessage<IMedia>) => {}) =>
        messenger.HandleMessage<IMedia>(
          {
            ...message,
            Type: MESSAGE_TYPE.MEDIA,
          },
          cb
        )
    );
    this.socket.on(
      MESSAGE_TYPE.GEO,
      (message: IMessage<IGeo>, cb: (_: IMessage<IGeo>) => {}) =>
        messenger.HandleMessage<IGeo>(
          { ...message, Type: MESSAGE_TYPE.GEO },
          cb
        )
    );
    this.socket.on(
      MESSAGE_TYPE.USER_ACTION,
      (message: IMessage<IUserAction>, cb: (_: IMessage<IUserAction>) => {}) =>
        messenger.HandleMessage<IUserAction>(
          {
            ...message,
            Type: MESSAGE_TYPE.USER_ACTION,
          },
          cb
        )
    );
  }

  private async addUserToRoom() {
    this.socket.join(await this.getUserId());
  }
}
