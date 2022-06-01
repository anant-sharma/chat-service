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
