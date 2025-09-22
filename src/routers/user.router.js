import { Router } from "express";
import { User } from '../models/userModel.js'
import { ApiError } from "../utils/ApiError.js";
import { genrateAccessAndRefreshToken, genrateRefreshToken, updateRefreshToken, verifyJwt } from '../controller/user.contoller.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { validUserSchema, validLoginSchema } from "../validators/user.validator.js";
import { ZodError } from "zod";
import { de, is, tr } from "zod/v4/locales";
import { bucket } from "../storage/storage.js";
import { upload } from "../utils/Multer.js";
const userRouter = Router()



userRouter.get('/', (req, res) => {
    console.log('hello welcome on the get route')
    res.json({
        msg: "hello"
    })
})
userRouter.post("/register", async (req, res) => {
    console.log('register hrerere')
    const { username, password, email, firstname, lastname } = req.body
    try {
        validUserSchema.parse({ username, password, email, firstname, lastname })
        console.log('running or not')


        //check the user exists or not
        const userExists = await User.findOne({
            $or: [{ email }, { username }]
        })
        if (userExists) {
            throw new ApiError(400, 'User already exists with this username or email')
        }
        const isCreated = await User.create({
            username,
            password,
            email,
            firstname,
            lastname
        })

        if (!isCreated) {
            throw new ApiError(500, "User Registration Failed")
        }


        const createdUser = await User.findById(User._id).select("-password -refreshtoken")
        console.log(createdUser)

        res.status(200).json(
            new ApiResponse(200, { createdUser }, "User created successfully")
        );
    } catch (error) {
        if (error instanceof ZodError) {
            // console.log('hello from zod')
            // throw new ZodError(400, error.errors);
            return res.json(error)
        }
        throw new ApiError(400, "something went wrong", error);
    }
})

userRouter.post('/login', async (req, res) => {
    console.log('login herer')
    const { username, password } = req.body
    try {
        const user = await validLoginSchema.parse({ username, password })
        console.log(user)
        const presentUser = await User.findOne({ username })
        console.log(!!presentUser)
        if (!presentUser) {
            throw new ApiError(400, "User is not present, Register before")
        }
        const isPassword = await presentUser.isPasswordCorrect(password)
        console.log('is password is', isPassword)
        if (!isPassword) {
            throw new ApiError(500, "Wrong Username and password")
        }

        const { refreshToken, accessToken } = await genrateAccessAndRefreshToken(presentUser._id)
        console.log('problme is')
        const loggedInuser = await User.findById(presentUser._id).select("-password -refreshToken")

        res.status(200)
            .cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true
            })
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true
            }).json(
                new ApiResponse(200, { user: loggedInuser, accessToken, refreshToken }, "User logged in successfully")
            )
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ApiError(500, 'zod error ')
        }
        console.log(error)
        throw new ApiError(400, "something unexpected", error)
    }
})



userRouter.post('/logout', verifyJwt, async (req, res) => {
    // console.log(req.user._id)
    const userId = req.userId
    try {
        await User.findByIdAndUpdate(userId, {
            $unset: {
                refreshtoken: 1   //this remove the field of the document
            }
        }, {
            new: true  //this option returns the updated document
        })

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }

        return res.status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json(new ApiResponse(200, {}, "User logged out successfully"))
    } catch (error) {
        throw new ApiError(400, "Unable to logout the account")
    }
})


userRouter.post('/update-dp',verifyJwt, upload.single('image'), async (req, res) => {
    try {
        // console.log(req.file.buffer.toString())
        if (!req.file) {
            throw new ApiError(400, "No image found")
        }
        
        const blob = bucket.file(`dp/`+Date.now() + '_' + req.file.originalname)
        const blobStream=blob.createWriteStream({
            resumable:false,
            contentType:req.file.mimetype
        })
        blobStream.on('error',(err)=>{
            console.log(err)
            throw new ApiError(500,"File upload failed")
        })

        blobStream.on('finish',async()=>{
            const publicUrl=`https://storage.googleapis.com/${bucket.name}/${blob.name}`

            if(publicUrl){
               const user= await User.findById(req.userId)
               console.log(user)
               await user.updateOne({profilePicture:publicUrl})
            }
            console.log(publicUrl)
             res.json({
            msg: "profile picture uploaded",
            publicUrl
        })
        })
        // console.log(blob)
        console.log('hello shekhar ')
        blobStream.end(req.file.buffer)
    
       
    } catch (error) {
        console.log(error)
        throw new ApiError(400, "file upload Error")
    }
})

userRouter.post('/refresh-token', updateRefreshToken)



export { userRouter }