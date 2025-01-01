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

dotenv.config();
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));
const app = createServer();

describe("students", () => {
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

  describe("with the route /api/students", () => {
    describe("given an instructer has been created and authenticated", () => {
      let token: string;
      let student: {};
      let studentId: string;
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
        student = {
          name: "Giannis Doe",
          gender: "Male",
          residence: "Main Street",
          password: "strongpassword1234",
          grade: 6,
          email: "giannisdoe@example.com",
          phone: "4567890123",
          dateOfBirth: "2001-02-17",
        };
      });

      it("should return 404 for student data empty ", async () => {
        const response = await supertest(app)
          .get("/api/students")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("No students found");
      });

      it("should return 201 for student created sucessfully", async () => {
        const response = await supertest(app)
          .post("/api/students")
          .set("Authorization", `Bearer ${token}`)
          .set("Content-Type", "application/json")
          .send(student);

        expect(response.status).toBe(201);
        expect(response.body).toStrictEqual({
          success: true,
          data: expect.any(Object),
        });
        studentId = response.body.data._id;
      });
      it("should return 200 for student fetched sucessfully", async () => {
        const response = await supertest(app)
          .get("/api/students")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          data: expect.any(Array),
          pagination: {
            total: expect.any(Number),
            page: 1,
            limit: 10,
            totalPages: expect.any(Number),
          },
        });
      });
      it("should return 200 for student updated sucessfully", async () => {
        const response = await supertest(app)
          .put(`/api/students/${studentId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: "John Doe",
            gender: "Male",
            residence: "Main Street",
            password: "strongpassword1234",
            grade: 6,
            email: "johndoe@example.com",
            phone: "4567890123",
            dateOfBirth: "2001-02-17",
          });
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          data: expect.objectContaining({
            name: "John Doe",
          }),
        });
      });
      it("should return 200 for student fetched sucessfully with Id as parmas", async () => {
        const response = await supertest(app)
          .get(`/api/students/${studentId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          data: expect.objectContaining({
            name: "John Doe",
          }),
        });
      });
      it("should return 200 for student deleted sucessfully", async () => {
        const response = await supertest(app)
          .delete(`/api/students/${studentId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          data: expect.any(Object),
        });
      });
    });
    describe("given a student has been created and authenticated", () => {
  let student: any;
  let token: string;

  beforeAll(async () => {
    try {
      student = await Student.create({
        name: "Kokoro",
        gender: "Male",
        residence: "Main Street",
        password: "strongpassword1234",
        grade: 6,
        email: "kokoro@example.com",
        phone: "4567890123",
        dateOfBirth: "2001-02-17",
      });
      token = jwt.sign(
        {
          id: student._id,
          email: "kokoro@example.com",
          modelType: "Student",
        },
        secretKey,
        { expiresIn: "1h" }
      );
    } catch (error) {
      throw error;
    }
  });

  it("should return 403 for unauthorized access when fetching all students", async () => {
    const response = await supertest(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      success: false,
      message: "Unauthorized: User is not an instructor",
    });
  });

  it("should return 200 for student fetched successfully with own ID as params", async () => {
    const response = await supertest(app)
      .get(`/api/students/${student._id}`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.body).toStrictEqual({
        success: true,
        data: expect.objectContaining({
          name: "Kokoro",
        }),
      });
    expect(response.status).toBe(200);
  });

  it("should return 200 for student attempting to update their own data", async () => {
    const response = await supertest(app)
      .put(`/api/students/${student._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Kokoro Doe",
        gender: "Male",
        residence: "Main Street",
        password: "strongpassword1234",
        grade: 6,
        email: "kokorodoe@example.com",
        phone: "4567890123",
        dateOfBirth: "2001-02-17",
      });

      expect(response.body).toStrictEqual({
        success: true,
        data: expect.objectContaining({
          name: "Kokoro Doe",
        }),
      });
    expect(response.status).toBe(200);
});

  it("should return 403 for unauthorized access for student attempting to delete another student data", async () => {
    const response = await supertest(app)
      .delete(`/api/students/${student._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toStrictEqual({
      success: false,
      message: "Unauthorized: User is not an instructor",
    });
  });
});  
});
});


