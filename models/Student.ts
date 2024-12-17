import { Schema } from "mongoose";
import BaseUser from "./BaseUser"; // Import the base model
import { Gender, Student } from "../types/model_types";

// Define the Student discriminator schema
const StudentSchema: Schema = new Schema({
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true,
  },
  residence: { type: String, required: true },
  grade: { type: Number, required: true },
  phone: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
});

// Create the Student discriminator
const Student = BaseUser.discriminator<Student>("Student", StudentSchema);

export default Student;
