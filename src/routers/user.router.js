import { Router } from "express";
import { User } from '../models/userModel.js'
import { ApiError } from "../utils/ApiError.js";
import { genrateAccessAndRefreshToken, genrateAccessToken, genrateRefreshToken } from '../controller/user.contoller.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { validUserSchema, validLoginSchema } from "../validators/user.validator.js";
import { ZodError } from "zod";
import { is, tr } from "zod/v4/locales";
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
        throw new ApiError(400, "something went wrong",error);
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
        .cookie('accesstoken',accessToken,{
            httpOnly:true,
            secure:true
        })
        .cookie('refreshtoken',refreshToken,{
            httpOnly:true,
            secure:true
        }).json(
            new ApiResponse(200,{user:loggedInuser,accessToken,refreshToken},"User logged in successfully")
        )
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ApiError(500, 'zod error ')
        }
        console.log(error)
        throw new ApiError(400, "something unexpected",error)
    }
})


export { userRouter }