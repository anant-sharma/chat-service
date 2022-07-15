import { v4 as uuidv4 } from "uuid";
import { MESSAGE_STATUS, MESSAGE_TYPE } from "../../constants";
import { MessageModel } from "../../models/message";
import { SSO } from "../../third-party/sso";
import {
  IAllLastInteractions,
  IControllerData,
  IGeo,
  IMedia,
  IMessage,
  IText,
  IUserAction,
  UserInfo,
} from "../../types";
import { Server } from "../Socket";

export class MessageController {
  public static async Get({
    sender = "",
    recipient = "",
    page = 1,
    limit = 10,
  }: IControllerData): Promise<IMessage<IText | IMedia | IGeo>[]> {
    const messages = await MessageModel.find({
      From: { $in: [sender, recipient] },
      To: { $in: [sender, recipient] },
      DeletedBy: { $ne: sender },
    })
      .sort({ Timestamp: -1 })
      .skip((+page - 1) * limit)
      .limit(+limit);

    return messages
      .map((m) => ({
        Identifier: m.Identifier,
        From: m.From,
        To: m.To,
        Data: m.Data,
        Type: m.Type,
        Status: m.Status,
        Timestamp: m.Timestamp,
        DeletedBy: m.DeletedBy,
      }))
      .sort((a, b) => {
        return new Date(a.Timestamp) < new Date(b.Timestamp) ? -1 : 1;
      });
  }

  public static async GetAllLastInteractions(
    user: string = "",
    token: string,
    limit: number = 1
  ): Promise<(IAllLastInteractions | null)[]> {
    const messages = await MessageModel.find({
      $or: [{ From: user }, { To: user }],
      DeletedBy: { $ne: user },
    })
      .sort({ Timestamp: -1 })
      .exec();

    if (!messages.length) {
      const welcomeMessage = await MessageController.AddInteraction<IText>({
        From: "messenger@chipserver.in",
        To: user,
        Type: MESSAGE_TYPE.TEXT,
        Data: "Welcome to Chipserver Messenger!!",
      });

      messages.push(welcomeMessage as any);
    }

    const lastInteractionsMap = messages.reduce(
      (result: { [key: string]: IAllLastInteractions }, message) => {
        const isSender = message.From === user;
        const targetUser = isSender ? message.To : message.From;

        if (!result[targetUser]) {
          result[targetUser] = {
            UserId: targetUser,
            Messages: [],
            UnreadCount: 0,
          };
        }

        result[targetUser]?.Messages.push(message);
        return result;
      },
      {}
    );

    const lastInteractions = Object.keys(lastInteractionsMap)
      .map((key: string) => {
        const value: IAllLastInteractions | undefined =
          lastInteractionsMap[key];

        if (!value) {
          return null;
        }

        value.UnreadCount = value.Messages.filter(
          (m) => m.Status !== MESSAGE_STATUS.READ && m.To === user
        ).length;
        value.Messages = value.Messages.slice(0, limit).map((m) => ({
          Identifier: m.Identifier,
          From: m.From,
          To: m.To,
          Data: m.Data,
          Type: m.Type,
          Status: m.Status,
          Timestamp: m.Timestamp,
          DeletedBy: m.DeletedBy,
        }));
        return value;
      })
      .filter((x) => x !== null);

    const usersInfo: UserInfo[] = await Promise.all(
      lastInteractions.map((li) => SSO.GetUserInfo(li?.UserId as string, token))
    );
    const usersInfoMap = usersInfo.reduce<{ [key: string]: UserInfo }>(
      (result, user) => {
        result[user.Email] = user;
        return result;
      },
      {}
    );
    return lastInteractions.map((li) => ({
      UserId: li?.UserId ?? "",
      Messages: li?.Messages ?? [],
      UnreadCount: li?.UnreadCount ?? 0,
      AvatarURL: usersInfoMap[li?.UserId as string].AvatarURL as string,
      Name: usersInfoMap[li?.UserId as string].Name as string,
    }));
  }

  public static async BulkDelete(
    user: string,
    Identifiers: string[]
  ): Promise<void> {
    const messages = await MessageModel.find({
      Identifier: { $in: Identifiers },
    }).exec();

    messages.forEach((m) => {
      m.DeletedBy.push(user);
      m.save();
    });
  }

  public static async DeleteAll(user: string): Promise<void> {
    const calls = await MessageModel.find({
      $or: [{ From: user }, { To: user }],
    }).exec();

    calls.forEach((c) => {
      if (!c.DeletedBy.includes(user)) {
        c.DeletedBy.push(user);
        c.save();
      }
    });

    return Promise.resolve();
  }

  public static async AddInteraction<T>(
    payload: Partial<IMessage<T>>
  ): Promise<IMessage<T>> {
    const message: IMessage<IMessage<T>> = {
      From: payload?.From || "",
      To: payload?.To || "",
      Type: payload?.Type || "",
      Data: payload?.Data || {},
      Timestamp: new Date(),
      Identifier: `${uuidv4()}@message`,
      Status: MESSAGE_STATUS.ACKNOWLEDGED,
      DeletedBy: [],
    };

    return new MessageModel(message).save();
  }

  public static async MarkUserAction(
    payload: Partial<IMessage<IUserAction>>
  ): Promise<IMessage<IMessage<IUserAction>>> {
    const payloadData = payload.Data as IUserAction;
    const payloadDataMessage = payloadData?.Data as IMessage<{}>;

    const message: IMessage<IMessage<IUserAction>> = {
      From: payload?.From || "",
      To: payload?.To || "",
      Type: payload?.Type || "",
      Data: payload?.Data || {},
      Timestamp: new Date(),
      Identifier: `${uuidv4()}@message`,
      Status: MESSAGE_STATUS.ACKNOWLEDGED,
      DeletedBy: [],
    };

    if (
      [MESSAGE_STATUS.DELIVERED, MESSAGE_STATUS.READ].includes(
        payloadData.Event
      )
    ) {
      MessageModel.updateMany(
        {
          To: payloadDataMessage?.To || "",
          From: payloadDataMessage?.From || "",
          Status: { $ne: MESSAGE_STATUS.READ },
        },
        {
          Status: payloadData.Event,
        }
      )
        .exec()
        .catch((e) => {
          console.trace(e);
        });
    }

    Server.emitMessage(payload?.To || "", "message", message);

    return message;
  }
}
