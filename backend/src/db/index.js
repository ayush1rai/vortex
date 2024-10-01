import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n mongoDB connected...database hosted at ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.log(`\n mongoDB connection failed...error:-`, error);
        process.exit(1);
    }
}

export default connectDB;