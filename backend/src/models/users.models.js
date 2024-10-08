import mongooose from "mongoose"

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    bio:{
        type: String,
        required: true
    },
    profileImage: String
},{timestamps:true})

export const User = mongoose.model("User", userSchema)