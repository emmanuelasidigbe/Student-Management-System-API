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

describe("courses", () => {
  let mongoServer: MongoMemoryServer;
  const secretKey = process.env.JWT_SECRET as string;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      await createInstructor();
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

  describe("with the route /api/courses", () => {
    describe("given an instructer has been created and authenticated", () => {
      let token: string;
      let course: any;
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
        course = {
          courseCode: "COE101",
          title: "Introduction to computer engineering",
          description:
            "This course provides an introduction to the fundamental concepts of computer engineering, including programming, algorithms, and data structures.",
          department: "Computer Engineering",
          semester: "Fall",
        };
      });
      it("should return status 404 for no courses found when fetching all courses", async () => {
        const response = await supertest(app)
          .get("/api/courses")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toStrictEqual({
          message: "No courses found",
          appliedFilter: expect.any(Object),
        });
      });
      it("should return status 201 creating a course", async () => {
        const response = await supertest(app)
          .post("/api/courses")
          .send(course)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(201);
        expect(response.body).toStrictEqual(
          expect.objectContaining({
            title: course.title,
          })
        );
      });

      it("should return status 200 for fetching all course", async () => {
        const response = await supertest(app)
          .get("/api/courses")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          message: "Courses retrieved successfully",
          appliedFilter: expect.any(Object),
          data: expect.any(Array),
        });
      });
      it("should return status 200 for getting course detail", async () => {
        const response = await supertest(app)
          .get(`/api/courses/${course.courseCode}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(expect.objectContaining(course));
      });
      it("should return status 200 for updated course successfully", async () => {
        const response = await supertest(app)
          .put(`/api/courses/${course.courseCode}`)
          .send({
            courseCode: "COE101",
            title: "Introduction to computer engineering",
            description:
              "This course provides an introduction to the fundamental concepts of computer engineering, including programming, algorithms, and data structures.",
            department: "Computer Engineering",
            semester: "Summer",
          })
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(
          expect.objectContaining({ semester: "Summer" })
        );
      });
      it("should return status 200 for deleted course successfully", async () => {
        const response = await supertest(app)
          .delete(`/api/courses/${course.courseCode}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual(
          expect.objectContaining({ message: "Course removed successfully" })
        );
      });
    });
    describe("given a student has been created and authenticated", () => {
      let student: any;
      let token: string;
      let course: any;

      beforeAll(async () => {
        course = {
          courseCode: "COE101",
          title: "Introduction to computer engineering",
          description:
            "This course provides an introduction to the fundamental concepts of computer engineering, including programming, algorithms, and data structures.",
          department: "Computer Engineering",
          semester: "Fall",
        };
        try {
          student = await Student.create({
            name: "John Doe",
            gender: "Male",
            residence: "Main Street",
            password: "strongpassword1234",
            grade: 6,
            email: "johndoe@example.com",
            phone: "4567890123",
            dateOfBirth: "2001-02-17",
          });
          token = jwt.sign(
            {
              id: student._id,
              email: "johndoe@example.com",
              modelType: "Student",
            },
            secretKey,
            { expiresIn: "1h" }
          );
        } catch (error) {
          throw error;
        }
      });

      it("should return status 404 for no courses found when fetching all courses", async () => {
        const response = await supertest(app)
          .get("/api/courses")
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toStrictEqual({
          message: "No courses found",
          appliedFilter: expect.any(Object),
        });
      });

      it("should return status 403 creating a course", async () => {
        const response = await supertest(app)
          .post("/api/courses")
          .send(course)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(403);
        expect(response.body).toStrictEqual(
          expect.objectContaining({
            success: false,
            message: "Unauthorized: User is not an instructor",
          })
        );
      });
        it("should return status 200 for fetching all course", async () => {
          try {
           await Course.create(course)
          } catch (error) {
            throw error
          }
          const response = await supertest(app)
            .get("/api/courses")
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(200);
          expect(response.body).toStrictEqual({
            message: "Courses retrieved successfully",
            appliedFilter: expect.any(Object),
            data: expect.any(Array),
          });
        });
        it("should return status 200 for getting course detail", async () => {
          const response = await supertest(app)
            .get(`/api/courses/${course.courseCode}`)
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(200);
          expect(response.body).toStrictEqual(expect.objectContaining(course));
        });
        it("should return status 403 for attempting to updated course", async () => {
          const response = await supertest(app)
            .put(`/api/courses/${course.courseCode}`)
            .send({
              courseCode: "COE101",
              title: "Introduction to computer engineering",
              description:
                "This course provides an introduction to the fundamental concepts of computer engineering, including programming, algorithms, and data structures.",
              department: "Computer Engineering",
              semester: "Summer",
            })
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(403);
                  expect(response.body).toStrictEqual(
                    expect.objectContaining({
                      success: false,
                      message: "Unauthorized: User is not an instructor",
                    })
                  );
        });
        it("should return status 403 for attempting to deleted course ", async () => {
          const response = await supertest(app)
            .delete(`/api/courses/${course.courseCode}`)
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(403);
                expect(response.body).toStrictEqual(
                  expect.objectContaining({
                    success: false,
                    message: "Unauthorized: User is not an instructor",
                  })
                );
        });
    });
  });
});
