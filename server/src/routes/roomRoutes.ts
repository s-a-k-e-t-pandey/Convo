import express from 'express'
import prisma from '../prismaSingleton';
import { isAuthenticated } from '../authMiddleware';


const roomRoutes = express();
roomRoutes.use(express.json());


//Create new room
roomRoutes.post('/', isAuthenticated, async(req, res)=>{
    try{
        console.log("room initiated")
        const {roomName} = req.body;
        console.log("room initiated")
        const room = await prisma.room.create({
            data: {
                name: roomName
            }
        })
        console.log("room created")
        return res.status(201).json({
            msg: room
        });
    }catch(e){
        console.error("Error while creating room", e);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})


//Get Room details
roomRoutes.get('/roomId', async(req, res)=>{
    try{
        const {roomId} = req.body;
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
        if(!room){
            return res.status(404).json({
                msg: "Room does not Exist"
            })
        }
        return res.status(200).json({
            msg: "room exist",
            room
        })
    }catch(e){
        console.error("Error while finding room", e);
        return res.status(500).json({ msg: 'Internal Server Error' });

    }
});

//Join a room
roomRoutes.post('/roomId/join', async (req, res)=>{
    try{
        const { roomId } = req.body;
        const {userId} = req.body;

        if (!userId || !roomId) {
            return res.status(400).json({ msg: "User ID and Room ID are required" });
        }

        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        })
        if(!room){
            return res.status(404).json({msg: "Room does not exist"})
        }

        const roomUserCount = await prisma.roomUser.count({
            where: {roomId},
        });

        if(roomUserCount >= 2){
            return res.status(403).json({msg: "Room is alloted"})
        }



        await prisma.roomUser.create({
            data: {
                roomId,
                userId
            }
        })
        return res.status(200).json({msg: 'Joined room successfully'});
    }catch(e){
        console.error("Error while joining room", e);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }
})


//Leave Room
roomRoutes.post('/roomId/leave', async(req, res)=>{
    try{
        const {roomId} = req.body;
        const {userId} = req.body;

        await prisma.roomUser.deleteMany({
            where: {
                roomId,
                userId
            }
        })
        return res.status(204).json({msg: "Left room successfully"})
    }catch(e){
        console.error("Error while leaving the room",e);
        return res.status(500).json({ msg: 'Internal Server Error' });
    }   
})

export default roomRoutes;