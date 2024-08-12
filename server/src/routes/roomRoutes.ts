import express from 'express'
import prisma from '../prismaSingleton';


const roomRoutes = express();
roomRoutes.use(express.json());


roomRoutes.post('/', async(req, res)=>{
    try{
        const {roomName} = req.body;
        const room = await prisma.room.create({
            data: {
                name: 
            }
        })
    }    
})


export default roomRoutes;