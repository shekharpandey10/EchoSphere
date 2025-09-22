import { User } from "../models/userModel.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import { ApiResponse } from "../utils/ApiResponse.js"



export const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log('1')
        const refreshToken = await user.genrateRefreshToken()
        console.log('2', refreshToken)
        const accessToken = await user.genrateAccessToken()
        console.log('3', accessToken)
        user.refreshtoken = refreshToken
        console.log('3.5')

        await user.save({ validateBeforeSave: false })
        console.log('4')
        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token and refresh token")
    }

}
export const genrateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.genrateAccessToken()
        return accessToken
    } catch (e) {
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}
export const genrateRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = await user.genrateRefreshToken()
        return refreshToken
    } catch (e) {
        throw new ApiError(500, "Something went wrong while generating refresh token")
    }
}

export const updateAccessToken=async (req, res) => {
    console.log('hlelfalkfj')
    console.log()
    const refreshTokenIncoming = req?.cookies?.refreshToken || req?.body?.refreshToken||req?.headers['refreshToken']

    console.log(refreshTokenIncoming)
    if (!refreshTokenIncoming) {
        throw new ApiError(500, "Unauthorized requrest")
    }


    try {
        const decoded = jwt.verify(refreshTokenIncoming, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh token")
        }

        if (refreshTokenIncoming !== user?.refreshtoken) {
            throw new ApiError(401, "Refresh token is invalid or used")
        }
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
        const accessToken = await user.genrateAccessToken(user._id)
        res.status(200).cookie('accessToken', accessToken, options)
            .json(
                new ApiResponse(200,
                    { accessToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
}