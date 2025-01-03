import supertest from "supertest";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import createServer from "../config/server";
import { MongoMemoryServer } from "mongodb-memory-server";
import dotenv from "dotenv";
import { createInstructor } from "../config/db";
import Student from "../models/Student";
dotenv.config();

const app = createServer();
jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

describe("Authentication", () => {
  let mongoServer: MongoMemoryServer;
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
  describe("given an instructor has been created", () => {
    let token: string;
    it("should return 404 if the user does not exist", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "test" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 401 if the password is incorrect", async () => {
      const response = await supertest(app)
        .post("/api/auth/login")
        .send({ email: "satoru@email.com", password: "wrongpassword" });
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid email or password");
    });
    it("should return 404 for a non-existing email when requesting password reset", async () => {
      const response = await supertest(app)
        .post("/api/auth/request-reset")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email not found");
    });
    it("should send a password reset token for a valid email", async () => {
      const response = await supertest(app)
        .post("/api/auth/request-reset")
        .send({ email: "satoru@email.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined(); // The token should be returned in the response

      token = response.body.token; /// this token is going to be used to reset the password for the instructor in the next test
    });
    it("should reset the password for the instructor", async () => {
      const response = await supertest(app)
        .post(`/api/auth/password-reset?token=${token}`)
        .send({ newPassword: "newstrongpassword1234" });
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        success: true,
        message: "Password reset successfully",
      });
    })
    it("should return 200 for login successfully", async () => {
        const response= await supertest(app).post("/api/auth/login")
        .send({email:"satoru@email.com",password:"newstrongpassword1234"})
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          message: "Login successful",
          token: expect.any(String),
          user: expect.any(Object),
        });
    })

  });
  describe("given a student has been created", () => {
    let token: string;
    let student: any;
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
          } catch (error) {
            throw error;
          }
    })
   it("should return 404 if the user does not exist", async () => {
     const response = await supertest(app)
       .post("/api/auth/login")
       .send({ email: "nonexistent@example.com", password: "test" });

     expect(response.status).toBe(404);
     expect(response.body.success).toBe(false);
     expect(response.body.message).toBe("Invalid email or password");
   });

   it("should return 401 if the password is incorrect", async () => {
     const response = await supertest(app)
       .post("/api/auth/login")
       .send({ email: student.email, password: "wrongpassword" });
     expect(response.status).toBe(401);
     expect(response.body.success).toBe(false);
     expect(response.body.message).toBe("Invalid email or password");
   });
   it("should return 404 for a non-existing email when requesting password reset", async () => {
     const response = await supertest(app)
       .post("/api/auth/request-reset")
       .send({ email: "nonexistent@example.com" });

     expect(response.status).toBe(404);
     expect(response.body.success).toBe(false);
     expect(response.body.message).toBe("Email not found");
   });
   it("should send a password reset token for a valid email", async () => {
     const response = await supertest(app)
       .post("/api/auth/request-reset")
       .send({ email: student.email });

     expect(response.status).toBe(200);
     expect(response.body.success).toBe(true);
     expect(response.body.token).toBeDefined(); // The token should be returned in the response

     token = response.body.token; /// this token is going to be used to reset the password for the student in the next test
   });
   it("should reset the password for the student", async () => {
     const response = await supertest(app)
       .post(`/api/auth/password-reset?token=${token}`)
       .send({ newPassword: "newstrongpassword1234" });
     expect(response.status).toBe(200);
   });
      it("should return 200 for login successfully", async () => {
        const response = await supertest(app).post("/api/auth/login").send({
          email: "kokoro@example.com",
          password: "newstrongpassword1234",
        });
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
          success: true,
          message: "Login successful",
          token: expect.any(String),
          user: expect.any(Object),
        });
      });
  });
});
