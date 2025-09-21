import { User } from "../models/userModel.js"
import { ApiError } from "../utils/ApiError.js"



export const genrateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        console.log('1')
        const refreshToken = await user.genrateRefreshToken()
        console.log('2',refreshToken)
        const accessToken = await user.genrateAccessToken()
        console.log('3',accessToken)
        user.refreshtoken=refreshToken
        console.log('3.5')

    //    await user.findByIdAndUpdate(userId,{refreshToken:refreshToken})
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