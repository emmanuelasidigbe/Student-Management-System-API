import  mongoose,{ Schema, model } from "mongoose";
import { Enrollment } from "../types/model_types";



const EnrollmentSchema: Schema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseCode: { type: String, ref: "Course", required: true },
    enrollmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default model<Enrollment>("Enrollment", EnrollmentSchema);
