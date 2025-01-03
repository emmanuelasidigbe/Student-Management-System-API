import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import createServer from "../config/server";
import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { createInstructor } from "../config/db";
import dotenv from "dotenv";
import Student from "../models/Student";
import Course from "../models/Course";
import redisClient from "../utils/redis_client";

dotenv.config();
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));
const app = createServer();

describe("Sorting Routes", () => {
  let mongoServer: MongoMemoryServer;
  const secretKey = process.env.JWT_SECRET as string;

  beforeAll(async () => {
    try {
      // Set up an in-memory MongoDB instance
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);

      // Seed database
      await createInstructor();

      await Student.insertMany([
        {
          name: "John Doe",
          email: "john.doe@example.com",
          password: "StrongPassword123",
          grade: 5,
          phone: "1234567890",
          gender: "Male",
          residence: "Downtown",
          dateOfBirth: new Date("2005-10-15"),
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          password: "SecurePass456",
          grade: 6,
          phone: "9876543210",
          gender: "Female",
          residence: "Uptown",
          dateOfBirth: new Date("2006-02-20"),
        },
        {
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          password: "Alex123Password",
          grade: 8,
          phone: "5555555555",
          gender: "Male",
          residence: "Midtown",
          dateOfBirth: new Date("2007-07-25"),
        },
      ]);

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
        {
          courseCode: "PHYS301",
          title: "Physics 301",
          description: "Advanced Physics",
          department: "Physics",
          semester: "Summer",
        },
        {
          courseCode: "CHEM102",
          title: "Chemistry 102",
          description: "Introduction to Chemistry",
          department: "Chemistry",
          semester: "Spring",
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
      await redisClient.quit();
    }
  });

  describe("GET /api/sort/students", () => {
    let token: string;

    beforeAll(() => {
      // Mock authentication token for instructor
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

    it("should return students sorted by grade in ascending order", async () => {
      const response = await supertest(app)
        .get("/api/sort/students?field=grade&order=asc")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.field).toBe("grade");
      expect(response.body.order).toBe("asc");
      expect(response.body.data).toEqual([
        { id: expect.any(String), name: "John Doe", grade: 5 },
        { id: expect.any(String), name: "Jane Smith", grade: 6 },
        { id: expect.any(String), name: "Alex Johnson", grade: 8 },
      ]);
    });

    it("should return students sorted by name in descending order", async () => {
      const response = await supertest(app)
        .get("/api/sort/students?field=name&order=desc")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.field).toBe("name");
      expect(response.body.order).toBe("desc");
      expect(response.body.data).toEqual([
        { id: expect.any(String), name: "John Doe", grade: expect.any(Number) },
        {
          id: expect.any(String),
          name: "Jane Smith",
          grade: expect.any(Number),
        },
        {
          id: expect.any(String),
          name: "Alex Johnson",
          grade: expect.any(Number),
        },
      ]);
    });
  });

  describe("GET /api/sort/courses", () => {
    let token: string;

    beforeAll(() => {
      // Mock authentication token for instructor
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

    it("should return courses sorted by title in ascending order", async () => {
      const response = await supertest(app)
        .get("/api/sort/courses?field=title&order=asc")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.field).toBe("title");
      expect(response.body.order).toBe("asc");
      expect(response.body.data).toEqual([
        {
          id: expect.any(String),
          courseCode: "CHEM102",
          title: "Chemistry 102",
        },
        { id: expect.any(String), courseCode: "HIST202", title: "History 202" },
        { id: expect.any(String), courseCode: "MATH101", title: "Math 101" },
        { id: expect.any(String), courseCode: "PHYS301", title: "Physics 301" },
      ]);
    });
        it("should return courses sorted by title in ascending order wihout specifying order", async () => {
          const response = await supertest(app)
            .get("/api/sort/courses?field=title")
            .set("Authorization", `Bearer ${token}`);
          expect(response.status).toBe(200);
          expect(response.body.field).toBe("title");
          expect(response.body.order).toBe("asc");
          expect(response.body.data).toEqual([
            {
              id: expect.any(String),
              courseCode: "CHEM102",
              title: "Chemistry 102",
            },
            {
              id: expect.any(String),
              courseCode: "HIST202",
              title: "History 202",
            },
            {
              id: expect.any(String),
              courseCode: "MATH101",
              title: "Math 101",
            },
            {
              id: expect.any(String),
              courseCode: "PHYS301",
              title: "Physics 301",
            },
          ]);
        });

    it("should return courses sorted by department in descending order", async () => {
      const response = await supertest(app)
        .get("/api/sort/courses?field=department&order=desc")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.field).toBe("department");
      expect(response.body.order).toBe("desc");
      expect(response.body.data).toEqual([
        {
          id: expect.any(String),
          courseCode: "PHYS301",
          department: "Physics",
          title: "Physics 301",
        },
        {
          id: expect.any(String),
          courseCode: "MATH101",
          department: "Mathematics",
          title: "Math 101",
        },
        {
          id: expect.any(String),
          courseCode: "HIST202",
          title: "History 202",
          department: "History",
        },
        {
          id: expect.any(String),
          courseCode: "CHEM102",
          department: "Chemistry",
          title: "Chemistry 102",
        },
      ]);
    });
  });
});
  