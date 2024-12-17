import mongoose,{ Document } from "mongoose"
export interface BaseUser extends Document {
  name: string;
  email: string;
  password: string;
  modelType: string; // Discriminator key to distinguish between models
}
export interface Student extends BaseUser {
  grade: number;
  residence: string;
  gender: Gender;
  phone: string;
  dateOfBirth: Date;
}

export interface Instructor extends BaseUser {
  school: string;
}
export interface Course extends Document {
  courseCode: string;
  title: string;
  description: string;
  department: string;
  semester: string;
}

export interface Enrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseCode: string;
  enrollmentDate: Date;
}


export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}
export enum Semester {
  Fall = "Fall",
  Spring = "Spring",
  Summer = "Summer",
}
