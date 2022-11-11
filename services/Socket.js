import { Server as SocketServer } from "socket.io";
import socketioJwt from "socketio-jwt";
import { Users } from "../models";

const { JWT_SECRET } = process.env;

class Socket {
  static init = (server) => {
    this.io = new SocketServer(server, {
      cors: '*'
    });

    this.io.use(socketioJwt.authorize({
      secret: JWT_SECRET,
      handshake: true
    }));

    this.io.on('connect', this.#handleConnect);
  }

  // static users = new Set()

  static #handleConnect = async (client) => {
    const { userId, isAdmin } = client.decoded_token;
    // const { authorization } = client.handshake.headers;
    // const { userId } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);

    if (isAdmin) {
      client.join('admin_room');
    }

    client.join(`user_${userId}`);

    // this.users.add(userId)
    client.on('disconnect', this.#handleDisconnect(userId));
    client.on('typing', this.#handleTyping(userId));

    await Users.update({
      isOnline: true,
    }, {
      where: { id: userId }
    });

    this.io.emit('user-connect', { userId });
  }

  static #handleDisconnect = (userId) => async () => {
    const lastVisit = new Date();
    await Users.update({
      lastVisit,
      isOnline: false,
    }, {
      where: { id: userId }
    });
    this.io.emit('user-disconnect', { userId, lastVisit });
  }

  static #handleTyping = (userId) => async (data) => {
    const { friendId } = data;
    this.io.to(`user_${friendId}`).emit('friend-typing', { friendId: userId })
  }

  static emitUser = (userId, event, data = {}) => {
    this.io.to(`user_${userId}`).emit(event, data);
  }
}

export default Socket;
