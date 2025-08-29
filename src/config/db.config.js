import mongoose from "mongoose";
import dotenv from "dotenv";
import { dbName } from "../constants.js";
dotenv.config({ "path": "./.env" });

// ;( async ()=>{
//     try {
//         const dbInstance = await mongoose.connect(process.env.MONGODB_URI);
//         console.log("Connected to MongoDB:", dbInstance.connection.host);
//     }
//     catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//     }
// })()

const connectDB = async () => {
    try {
        const dbInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
        console.log("Connected to MongoDB:", dbInstance.connection.host);
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}
export default connectDB;