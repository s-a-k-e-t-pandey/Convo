import express from "express"
import WebSocket from "ws"
import http from "http";
import cors from "cors";
import session from "express-session"
import userRoutes from "./routes/userRoutes";
import roomRoutes from "./routes/roomRoutes";
import prisma from "./prismaSingleton";



const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true
}))

const PORT = process.env.PORT || 8001; // Change to a different port number


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 100 * 60 * 60 * 24,
        sameSite: "lax"
    }
})

app.use(sessionMiddleware);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/room", roomRoutes);


// app.get('/api/v1/session', (req, res) => {
//     if (req.session.user) {
//         res.json({ 
//             isAuthenticated: true, 
//             user: req.session.user 
//         })
//     } else {
//         res.status(401).json({ 
//             isAuthenticated: false 
//         })
//     }
// })


type Data = {
    userId: string;
    roomId: string;
}

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = new Map(); //store connected users with their room info

wss.on('connection', (ws: WebSocket) => {
    ws.on('error', console.error);

    ws.on('message', async (message) => {
        const { type, data } = JSON.parse(message.toString());

        switch (type) {
            
            case 'sender':
                console.log("Sender added");
                senderSocket = ws;
                break;

            case 'receiver':
                console.log("Receiver added");
                receiverSocket = ws;
                break;

            case 'createOffer':
                if (ws !== senderSocket) return;
                console.log("Sending offer");
                receiverSocket?.send(JSON.stringify({ type: 'createOffer', sdp: data.sdp }));
                break;

            case 'createAnswer':
                if (ws !== receiverSocket) return;
                console.log("Sending answer");
                senderSocket?.send(JSON.stringify({ type: 'createAnswer', sdp: data.sdp }));
                break;

            case 'iceCandidate':
                console.log("Sending ICE candidate");
                if (ws === senderSocket) {
                    receiverSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: data.candidate }));
                } else if (ws === receiverSocket) {
                    senderSocket?.send(JSON.stringify({ type: 'iceCandidate', candidate: data.candidate }));
                }
                break;

            case 'join_room':
                handleJoinRoom(ws, data);
                ws.send("lobby")
                break;

            case 'send_message':
                handleSendMessage(ws, data);
                break;

            case 'start_call':
                handleStartCall(ws, data);
                break;

            case 'webrtc_signal':
                handleWebRTCSignal(ws, data);
                break;

            case 'leave_room':
                handleLeaveRoom(ws, data);
                break;

            default:
                break;
        }
    });

    ws.on('close', () => {
        handleDisconnect(ws);
    });
});

//have to fix the types
const handleJoinRoom = async (ws: WebSocket, data: Data) => {
    const { roomId, userId } = data;

    const roomUserCount = await prisma.roomUser.count({
        where: {
            id: roomId
        }
    })

    if (roomUserCount >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
        return;
    }
    users.set(userId, { ws, roomId });
    ws.send(JSON.stringify({ type: 'joined_room', roomId }));
}

const handleLeaveRoom = async (ws: any, message: any) => {
    const { userId, roomId } = message;

    //remove user from room
    users.delete(userId);

    //remove user from db
    await prisma.roomUser.deleteMany({
        where: {
            roomId,
            userId
        }
    })

    ws.send(JSON.stringify({ type: 'left_room', roomId }));
}

const handleSendMessage = async (ws: any, message: any) => {
    const { roomId, content, senderId, receiverId } = message;
    await prisma.message.create({
        data: {
            content,
            sender: {
                connect: { id: senderId }
            },
            receiver: {
                connect: { id: receiverId }
            },
            room: {
                connect: { id: roomId }
            }
        }
    });

    //Broadcast the message to all users in the room
    users.forEach((user, userId) => {
        if (user.roomId === roomId) {
            user.ws.send(JSON.stringify({ type: 'receive_message', senderId, content }))
        }
    });
}


const handleStartCall = (ws: any, message: any) => {
    const { roomId, userId } = message;

    //find other users in same room
    const peers = Array.from(users.values()).filter(user => user.roomId === roomId && user.ws !== ws)

    peers.forEach(peer => {
        peer.send(JSON.stringify({ type: "call_initiated", from: userId }));
    })

    ws.send(JSON.stringify({ type: 'call_started', to: peers.map(p => p.userId) }));
}


const handleWebRTCSignal = (ws: any, message: any) => {
    const { signal, to, from } = message;

    const targetUser = users.get(to);
    if (targetUser) {
        targetUser.ws.send({ type: 'webrtc_signal', signal, from })
    }
};


const handleDisconnect = (ws: any) => {
    //find and remove disconnected users from room
    for (const [userId, user] of users.entries()) {
        if (user.ws === ws) {
            users.delete(userId)
            break;
        }
    }
}


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})