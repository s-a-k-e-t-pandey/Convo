import express from "express";
import { signinInput } from "../zod";
import {PrismaClient} from "@prisma/client"
import bcrypt from "bcrypt"

const userRoutes = express();
const prisma = new PrismaClient();
userRoutes.use(express.json());

userRoutes.post('/login', async(req, res)=>{
    try{
        const {success} =  signinInput.safeParse(req.body);
        if(!success){
            res.status(411) //length required
            return res.json({
                msg: "Invalid Inputs"
            })
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                email: req.body.email
            }
        })
        if(!existingUser){
            res.status(404)
            return res.json({
                msg: "Invalid User Access"
            })
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword
            }
        })
    }
})