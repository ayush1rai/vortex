import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
const generateRefreshAndAccessTokens = async (userId) =>{
    try{
        const userById = await User.findById(userId)
        const accessToken = userById.generateAccessToken()
        const refreshToken = userById.generateRefreshToken()

        userById.refreshToken = refreshToken
        await userById.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, error?.message || "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async(req, res) =>{
    const {fullName, email, userName, password, bio} = req.body
    if(
        [fullName, email, userName, password, bio].some(field => field?.trim() === "")
    ){
        throw new ApiError(400, "Please fill in the required fields")
    }

    const existedUserWithUserName = await User.findOne({
        $or: [{ userName: userName.toLowerCase() }]
    })

    const existedUserWithEmail = await User.findOne({
        $or: [{ email }]
    })

    if(existedUserWithUserName) throw new ApiError(409, "Username already taken")

    if(existedUserWithEmail) throw new ApiError(409, "Email already registered")

    const user = await User.create({
        fullName,
        email,
        password,
        bio,
        userName: userName.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) throw new ApiError(500, "Something went wrong while registration")
    
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

    
})

const loginUser = asyncHandler(async(req, res) =>{
    const {userName, email, password} = req.body

    if(!userName && !email){
        throw new ApiError(400, "enter either email or username")
    }

    const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    console.log(user)
    if(!user){
        throw new ApiError(400, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400, "wrong password")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))

})

const refreshToken = asyncHandler(async(req, res) => {try
    {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
        if(!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")
        
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedRefreshToken._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "expired or used refresh token")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const{accessToken, newRefreshToken} = await generateRefreshAndAccessTokens(user._id)
    
        return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(201, {accessToken, refreshToken: newRefreshToken}, "Access Token Refreshed"))
        
    
        
    }
 catch (error) {
    throw new ApiError(401, error?.message || "refresh token could not be refreshed")
}
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) throw new ApiError(401, "invalid old password")
    
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, bio, email} = req.body

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                bio
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})

//have to add image adding and updation feature
//updation requires another feature rather than the upper one
//have to add subscription feature
//have to update status codes of all the responses

export { registerUser,
         loginUser,
         logoutUser,
         refreshToken,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails
 }