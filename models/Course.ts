import  { Schema,model } from "mongoose";
import { Course, Semester } from "../types/model_types";


const CourseSchema: Schema = new Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    department: { type: String, required: true },
    semester: { type: String,enum:Object.values(Semester) ,required: true },
  },
  { timestamps: true }
);

export default model<Course>("Course", CourseSchema);
