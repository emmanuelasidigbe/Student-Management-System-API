import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import createServer from "../config/server";
import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { createInstructor } from "../config/db";
import dotenv from "dotenv";
import Student from "../models/Student";
import Course from "../models/Course";

dotenv.config();
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));
const app = createServer();

describe("enrollments", () => {
  let mongoServer: MongoMemoryServer;
  let secretKey=process.env.JWT_SECRET as string
  let student:any;
  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      await createInstructor();
     student =  await Student.create({
        name: "John Doe",
        email: "john.doe@example.com",
        password: "StrongPassword123",
        grade: 5,
        phone: "1234567890",
        gender: "Male",
        residence: "Downtown",
        dateOfBirth: "2005-10-15",
      });
      await Course.insertMany([
        {
          courseCode: "MATH101",
          title: "Math 101",
          description: "Basic Mathematics",
          department: "Mathematics",
          semester: "Fall",
        },
        {
          courseCode: "HIST202",
          title: "History 202",
          description: "World History",
          department: "History",
          semester: "Summer",
        },
        
      ]);
    } catch (error) {
      throw error;
    }
  });
   
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
  describe("with the route /api/enrollments", () => {
      describe("given an instructor has been created and authenticated", () => {
        let token: string;
        let enrollmentId: string;
              beforeAll(async () => {
                token = jwt.sign(
                  {
                    id: "mockInstructorId",
                    email: "satoru@email.com",
                    modelType: "Instructor",
                  },
                  secretKey,
                  { expiresIn: "1h" }
                );
              });
            
          it("should return 404 for fetching all enrollments for a course", async () => {
            const response = await supertest(app)
              .get(`/api/enrollments/course/MATH101`)
              .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);

            expect(response.body).toStrictEqual({
              message: "No enrollments found for this course",
            });
          })
            
          it("should return 404 for fetching enrollments for a student", async () => {
            const response = await supertest(app)
              .get(`/api/enrollments/student/${student._id}`)
              .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(404);
            expect(response.body).toStrictEqual({
              message:
                "No enrollments found for this student",
            });
          })
          it("should return 201 for enrolling a student in a course ",async ()=>{
             const response = await supertest(app)
               .post(`/api/enrollments`)
               .set("Authorization", `Bearer ${token}`)
               .send({
                 studentId: student._id,
                 courseCode: "MATH101",
               });
             expect(response.status).toBe(201);
             expect(response.body).toStrictEqual({
               message: "Student enrolled successfully",
               enrollment: expect.any(Object),
             });
             enrollmentId = response.body.enrollment._id;
          })
            it("should return 200 for fetching all enrollments for a course", async () => {
              const response = await supertest(app)
                .get(`/api/enrollments/course/MATH101`)
                .set("Authorization", `Bearer ${token}`);
              expect(response.status).toBe(200);

              expect(response.body).toStrictEqual({
                success: true,
                data: expect.any(Array),
                pagination: expect.any(Object),
              });
            });
             it("should return 200 for fetching enrollments for a student", async () => {
               const response = await supertest(app)
                 .get(`/api/enrollments/student/${student._id}`)
                 .set("Authorization", `Bearer ${token}`);
               expect(response.status).toBe(200);
               expect(response.body).toStrictEqual(expect.any(Array));
             });
            it("should return 200 for attempting to cancel enrollment for a student",async ()=>{
              const response = await supertest(app)
                .delete(`/api/enrollments/${enrollmentId}`)
                .set("Authorization", `Bearer ${token}`);
              expect(response.status).toBe(200);
              expect(response.body).toStrictEqual({
                message: "Enrollment canceled successfully",
              });
            })
      })
      describe("given a student has been created and authenticated", () => {
                let token: string;
                let enrollmentId: string;
                beforeAll(async () => {
                  token = jwt.sign(
                    {...student},
                    secretKey,
                    { expiresIn: "1h" }
                  );
                });
            it("should return 403 for fetching all enrollments for a course", async () => {
              const response = await supertest(app)
                .get(`/api/enrollments/course/MATH101`)
                .set("Authorization", `Bearer ${token}`);
                console.log(response.text);
              expect(response.status).toBe(403);
              expect(response.body).toStrictEqual({
                  success:false, message:"Unauthorized: User is not an instructor"
              })
            })
      })
  })
});

