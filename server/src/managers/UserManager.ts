import WebSocket from "ws";
import { RoomManager } from "./RoomManager";


export interface User {
  ws: WebSocket;
  name: string;
  id: string;
}


export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;

  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }

  addUser(name: string, ws: WebSocket, clientId: string) {
    const id = clientId;
    this.users.push({
      name,
      ws,
      id,
    });
    this.queue.push(id);
    console.log("Add User Queue length is " + this.queue.length);
    ws.send(JSON.stringify({ type: "lobby" }));
    this.clearQueue();
    this.initHandlers(ws, id);
  }

  removeUser(socketId: string) {
    const user = this.users.find((x) => x.id === socketId);

    this.users = this.users.filter((x) => x.id !== socketId);
    this.queue = this.queue.filter((x) => x !== socketId);
  }

  clearQueue() {
    console.log("inside clear queues");
    console.log(this.queue.length);
    if (this.queue.length < 2) {
      return;
    }

    const id1 = this.queue.pop();
    const id2 = this.queue.pop();
    console.log("id1 is " + id1 + " id2 is " + id2);
    const user1 = this.users.find((x) => x.id === id1);
    const user2 = this.users.find((x) => x.id === id2);

    if (!user1 || !user2) {
      return;
    }
    console.log("creating room");

    const room = this.roomManager.createRoom(user1, user2);
    this.clearQueue();
  }

  initHandlers(ws: WebSocket, id: string) {
    ws.on("open", () => {
      console.log("Connected to WebSocket server");
    });

    ws.on("message", async (event) => {
      const data = JSON.parse(event.toString());
      console.log("Received message string", data.type);
      switch (data.type) {
        case "offer":
          this.roomManager.onOffer(data.roomId, data.sdp, id);
          break;
        case "answer":
          this.roomManager.onAnswer(data.roomId, data.sdp, id);
          break;
        case "add-ice-candidate":
          this.roomManager.onIceCandidates(data.roomId, id, data.candidate, data.messageType);
          break;
        default:
          console.log("Unknown message messageType from backend");
      }
    });


    ws.on("close", () => {
      console.log("Disconnected from WebSocket server");
    });

    ws.on("error", (event) => {
      console.log("Error occurred", event);
    });
  }
}