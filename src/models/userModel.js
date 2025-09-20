import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
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
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.genrateAccessToken = async function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.genrateRefreshToken = async function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET), {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
}

export const User = mongoose.model('User', userSchema)