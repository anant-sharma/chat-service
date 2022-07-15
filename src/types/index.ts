import { JwtPayload } from "jsonwebtoken";

export interface IMessage<T> {
  Identifier: string;
  Type: string;
  From: string;
  To: string;
  Data: T | {};
  Status: string;
  Timestamp: Date;
  DeletedBy: string[];
}

export type IText = string;

export type IMedia = {
  MediaType: string;
  Location: string;
  Key: string;
  Bucket: string;
  Size: number;
  MetaData: any;
};

export type IGeo = {
  Lat: number;
  Long: number;
};

export type IUserAction = {
  Event: string;
  Data?: any;
};

export type IControllerData = Partial<{
  sender: string;
  recipient: string;
  page: number;
  limit: number;
}>;

export interface IAllLastInteractions {
  UserId: string;
  Messages: IMessage<any>[];
  UnreadCount: number;
  AvatarURL?: string;
  Name?: string;
}

export interface IFile {
  User: string;
  Key: string;
  Data: Express.Multer.File;
}

export interface IUser {
  name: string;
  deviceToken: string;
}

export interface JWTPayload extends JwtPayload {
  payload: {
    uid: string;
  };
}

export type UserInfo = {
  ID: string;
  Name: string;
  Email: string;
  RawData: {
    email: string;
    id: string;
    picture: string;
    verified_email: boolean;
  };
  Provider: string;
  FirstName: string;
  LastName: string;
  NickName: string;
  AvatarURL: string;
  Location: string;
};
