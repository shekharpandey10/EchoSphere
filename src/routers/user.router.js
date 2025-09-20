import { Router } from "express";
import { User } from '../models/userModel.js'
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validUserSchema } from "../validators/user.validator.js";
import { ZodError } from "zod";
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
        throw new ApiError(400, error.message);
    }
})


export { userRouter }