import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
  user1: User,
  user2: User,
}

export class RoomManager {
  private rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map<string, Room>()
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    })

    user1.ws.send(JSON.stringify({
      type: "send-offer",
      roomId
    }))

    user2.ws.send(JSON.stringify({
      type: "send-offer",
      roomId
    }))
  }

  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser = room.user1.id === senderSocketid ? room.user2 : room.user1;
    console.log("OnOFfer");
    receivingUser?.ws.send(JSON.stringify({
      type: "offer",
      sdp,
      roomId
    }))
  }

  onAnswer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser = room.user1.id === senderSocketid ? room.user2 : room.user1;
    console.log("OnAnswer");
    receivingUser?.ws.send(JSON.stringify({
      type: "answer",
      sdp,
      roomId
    }));
  }

  onIceCandidates(roomId: string, senderSocketid: string, candidate: any, role: "sender" | "receiver") {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser = room.user1.id === senderSocketid ? room.user2 : room.user1;
    receivingUser.ws.send(JSON.stringify({
      type: "add-ice-candidate",
      candidate,
      role
    }));
  }

  generate() {
    return GLOBAL_ROOM_ID++;
  }
}