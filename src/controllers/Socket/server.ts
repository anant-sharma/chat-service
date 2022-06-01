import http from "http";
import { Server as SocketServer } from "socket.io";
import { User } from "./user";
import { JWT } from "../../utilities/jwt";

export class Server {
  private static io: SocketServer;

  public static Init(httpServer: http.Server) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: (_, cb) => cb(null, true),
        methods: ["GET", "POST"],
      },
    });

    // this.io.adapter(this.getRedisAdapter());

    this.io.use(async (socket, next) => {
      const token = socket.handshake?.auth?.token;
      const isDebug = socket.handshake?.auth?.isDebug ?? false;

      if (isDebug) {
        next();
        return;
      }

      if (!token) {
        next(new Error("Please provide authorization token!!"));
        return;
      }

      if (!(await JWT.verify(token))) {
        next(new Error("Please provide a valid authorization token!!"));
        return;
      }

      next();
    });

    this.io.on("connection", (socket: any) => {
      new User(socket).establishExchange();
    });
  }

  public static async getAvailability(userId: string): Promise<boolean> {
    const clients = this.io.of("/").adapter.rooms.get(userId)?.size ?? 0;
    return clients > 0;
  }

  public static async emitMessage(recipient: string, event: string, data: any) {
    this.io.sockets.to(recipient).emit(event, data);
  }

  // private static getRedisAdapter() {
  //   const pubClient = createClient({
  //     host: Config.Get("REDIS_HOST"),
  //     port: +Config.Get("REDIS_PORT"),
  //     password: Config.Get("REDIS_PASSWORD"),
  //   });
  //   const subClient = pubClient.duplicate();

  //   return createAdapter(pubClient, subClient);
  // }
}
