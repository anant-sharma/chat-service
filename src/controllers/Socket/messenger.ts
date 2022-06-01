import { v4 as uuidv4 } from "uuid";
import { MESSAGE_STATUS, MESSAGE_TYPE } from "../../constants";
import { MessageModel } from "../../models/message";
import { IMessage, IUserAction } from "../../types";

export class Messenger {
  constructor(private socket: any, private userIdentifier: string) {}

  public HandleMessage<T>(message: IMessage<T>, cb: (_: IMessage<T>) => {}) {
    try {
      this.addBaseInformation<T>(message);
      this.socket.to(message.To).emit(MESSAGE_TYPE.MESSAGE, message);
      this.socket.to(message.From).emit(MESSAGE_TYPE.MESSAGE, message);

      switch (message.Type) {
        case MESSAGE_TYPE.TEXT:
        case MESSAGE_TYPE.MEDIA:
        case MESSAGE_TYPE.GEO: {
          new MessageModel(message).save();
          break;
        }
        case MESSAGE_TYPE.USER_ACTION: {
          const userActionData = message?.Data as unknown as IUserAction;

          if (userActionData) {
            switch (userActionData.Event) {
              case MESSAGE_STATUS.DELIVERED: {
                this.updateMessageStatus<T>(
                  MESSAGE_STATUS.DELIVERED,
                  userActionData.Data
                );
                break;
              }
              case MESSAGE_STATUS.READ: {
                this.updateMessageStatus<T>(
                  MESSAGE_STATUS.READ,
                  userActionData.Data
                );
                break;
              }
            }
          }
          break;
        }
      }

      if (cb && typeof cb === "function") {
        cb(message);
      }
    } catch (e) {
      console.trace(e);
    }
  }

  private addBaseInformation<T>(message: IMessage<T>) {
    try {
      message.From = this.userIdentifier;
      message.Timestamp = new Date();
      message.Identifier = `${uuidv4()}@message`;
      message.Status = MESSAGE_STATUS.ACKNOWLEDGED;
    } catch (e) {
      console.error(e);
    }
  }

  private updateMessageStatus<T>(status: string, message: IMessage<T>) {
    MessageModel.updateMany(
      {
        To: message.To,
        From: message.From,
        Status: { $ne: MESSAGE_STATUS.READ },
      },
      {
        Status: status,
      }
    ).exec();
  }
}
