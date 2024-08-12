import express from "express";
import { PrismaClient } from "@prisma/client";
import {WebSocket, WebSocketServer} from "ws";

const prisma = new PrismaClient();
const wss = new WebSocketServer({noServer: true})
const mediumRoutes = express();
mediumRoutes.use(express.json());


mediumRoutes.get('/messages', async(req, res)=>{
    try{
        const messages = await prisma.message
    }
})




export default mediumRoutes;