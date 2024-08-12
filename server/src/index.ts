import express from "express"
import { WebSocket, WebSocketServer } from "ws"
import http from "http";
import cors from "cors";
import session from "express-session"
import userRoutes from "./routes/userRoutes";
import mediumRoutes from "./routes/mediumRoutes";
import roomRoutes from "./routes/roomRoutes";

const RedisStore = require('connect-redis')(session);  

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    methods:['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true
}))


const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    store: new RedisStore({ url: process.env.REDIS_URL }),
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
app.use("/api/v1/medium", mediumRoutes);
app.use('/api/v1/room', roomRoutes)


app.get('/api/v1/session', (req, res) => {
    if (req.session.user) {
        res.json({ 
            isAuthenticated: true, 
            user: req.session.user 
        })
    } else {
        res.status(401).json({ 
            isAuthenticated: false 
        })
    }
})

const server = http.createServer(app);


server.listen(3000, ()=>{
    console.log("Server is running on port 3000")
})