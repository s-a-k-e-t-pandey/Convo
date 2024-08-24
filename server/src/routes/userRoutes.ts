import express from "express";
import { signinInput } from "../zod";
import {PrismaClient} from "@prisma/client"
import bcrypt from "bcrypt"

const userRoutes = express();
const prisma = new PrismaClient();
userRoutes.use(express.json());


userRoutes.post('/signup', async(req,res)=>{
    try{
        const {success} = signinInput.safeParse(req.body);
        if(!success){
            res.status(411);
            return res.json({
                msg: "Invalid user Input"
            })
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                email: req.body.email
            }
        })
        if(existingUser){
            res.status(409)
            return res.json({
                msg: "User Already exist"
            })
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = await prisma.user.create({
            data: {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            }
        })

        req.session.user = {
            username: user.username,
            email: user.email,
        }

        res.status(200)
        return res.json({
            signup: true,
            user: {
                email: user.email,
                username: user.email
            }
        })
    }catch(e) {
        console.log(e)
        return res.status(400).json({
            msg: "Error while Signing up"
        })
    }
})

userRoutes.post('/signin', async(req, res)=>{
    try{
        const {success} =  signinInput.safeParse(req.body);
        if(!success){
            res.status(411) //length required
            return res.json({
                msg: "Invalid Inputs"
            })
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {username: req.body.username},
                    {email: req.body.email}
                ]
            }
        })
        if(!user){
            res.status(404)
            return res.json({
                msg: "Invalid User Access"
            })
        }
        const passwordValidation = await bcrypt.compare(req.body.password, user.password)
        if(!passwordValidation){
            res.status(403)
            return res.json({msg: "Incorrect Password"})
        }

        req.session.user = {
            username: user.username,
            email: user.email,
        }

        return res.status(200).json({
            signin: true,
            user: {
                email: user.email,
                username: user.username
            }
        })  
    }catch(e){
        console.log(e)
        res.status(400).json({
            msg: "Error while signing up"
        })
    }
})


userRoutes.get("/signout", async(req,res)=>{
    try{
        res.clearCookie('connect.sid',{path:'/'})
        console.log('hey im here')
        return res.json({
            signout: true
        })
    }catch(e){
        res.status(400)
        console.log('error while signout',e)
    }
})

export default userRoutes;