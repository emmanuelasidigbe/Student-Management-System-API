import mongoose from "mongoose";
import logger from "../utils/logger";
import  Instructor  from "../models/Instructor";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI! as string)
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
const createInstructor = async () => {
    try {
      const instructor = await Instructor.findOne({ email: "satoru@email.com" });
      if (!instructor) {
        const newInstructor = await Instructor.create({
          name: "Satoru Gojo",
          email: "satoru@email.com",
          password: "myStrongPassword",
          school: "Tokyo Metropolitan University",
        });
        
        logger.info("Instructor created successfully");
        return
      }
      logger.info("Instructor already exists");
    } catch (error) {
      logger.error("Error creating instructor:", error);
    }
}
export { connectDB as default, createInstructor }; ;
