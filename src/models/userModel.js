import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ApiError } from "../utils/ApiError.js";
const userSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String
    },
    bio: {
        type: String
    },
    refreshtoken: {
        type: String
    }
}, { timestamps: true })


userSchema.pre('save', async function (next) {
    try{
        if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
    }catch(error){
        throw new ApiError(500,"pre-save hook error")
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (e) {
        console.error(e)
    }
}

userSchema.methods.genrateAccessToken = async function () {
    try {
        console.log(process.env.ACCESS_TOKEN_SECRET)
        return jwt.sign({
            _id: this._id,
            email: this.email,
            username: this.username
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        })
    } catch (e) {
        throw new ApiError(500, "Access token genration error")
    }
}
userSchema.methods.genrateRefreshToken = async function () {
    console.log(process.env.REFRESH_TOKEN_SECRET)

    try {
        return jwt.sign({
            _id: this._id
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        })
    } catch (e) {
        throw new ApiError(500, "Refresh token genration error")
    }
}

export const User = mongoose.model('User', userSchema)