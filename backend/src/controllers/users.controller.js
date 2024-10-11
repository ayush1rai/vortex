import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
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
export { registerUser }