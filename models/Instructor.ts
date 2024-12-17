import { Schema } from "mongoose";
import BaseUser from "./BaseUser"; // Import the base model
import { Instructor } from "@/types/model_types";

// Define the Instructor discriminator schema
const InstructorSchema: Schema = new Schema({
    school: { type: String, required: true },
});

const Instructor = BaseUser.discriminator<Instructor>("Instructor", InstructorSchema);

export default Instructor;
