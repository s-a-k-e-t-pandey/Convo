import express from "express"
import WebSocket from "ws"
import http from "http";
import cors from "cors";
import { UserManager } from "./managers/UserManager";
import session from "express-session"
import userRoutes from "./routes/userRoutes";
import roomRoutes from "./routes/roomRoutes";
import { v4 as uuidv4 } from 'uuid';



const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true
}))


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


const server = http.createServer(app);

const wss = new WebSocket.Server({ server, path: "/ws" });

const userManager = new UserManager();

wss.on('connection', (ws) => {
    const clientId: string = uuidv4();
    console.log('a user connected');
    userManager.addUser("randomName", ws, clientId);
  
    ws.on('close', () => {
      console.log("user disconnected");
      userManager.removeUser(clientId);
    });
  
    ws.on('error', (error) => {
      console.error('Error occurred', error);
    });
  });

server.listen(3000, () => {
    console.log(`Server is running on port 3000`)
})