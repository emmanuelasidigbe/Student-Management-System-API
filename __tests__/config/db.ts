import { afterAll, beforeAll, describe, it,jest,expect } from "@jest/globals";
import mongoose from "mongoose";
import connectDB, { createInstructor } from "../../config/db"; 
import Instructor from "../../models/Instructor"; 
import logger from "../../utils/logger";
import dotenv from "dotenv";
dotenv.config();
// Mock dependencies
jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

jest.mock("../../models/Instructor", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../utils/logger", () => ({
  debug: jest.fn(),
  warn:jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe("Database Connection Tests", () => {
    jest
      .spyOn(process, "exit")
      .mockImplementation((code?: any) => {
        throw new Error(`process.exit called with "${code}"`);
      });

  it("should connect to MongoDB successfully", async () => {
    const mockConnection = { connection: { host: "mockHost" } };
    jest.spyOn(mongoose,"connect").mockResolvedValueOnce(mockConnection as any);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
    expect(logger.info).toHaveBeenCalledWith(
      `MongoDB Connected: ${mockConnection.connection.host}`
    );
  });

  it("should log an error if connection fails", async () => {
    const mockError = new Error("Connection failed");
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(mockError as never);

    await expect(connectDB()).rejects.toThrow("process.exit"); // Simulating process.exit
    expect(logger.error).toHaveBeenCalledWith(
      "Error connecting to MongoDB:",
      mockError
    );
  });
});

describe("Create Instructor Tests", () => {
  it("should create a new instructor if not found", async () => {
    (Instructor.findOne as jest.Mock).mockResolvedValueOnce(null as never); // No instructor found
    const mockInstructor = {
      name: "Satoru Gojo",
      email: "satoru@email.com",
      password: "myStrongPassword",
      school: "Tokyo Metropolitan University",
    };
    jest.spyOn(Instructor,"create").mockResolvedValueOnce(mockInstructor as any);

    await createInstructor();

    expect(Instructor.findOne).toHaveBeenCalledWith({
      email: "satoru@email.com",
    });
    expect(Instructor.create).toHaveBeenCalledWith(mockInstructor);
    expect(logger.info).toHaveBeenCalledWith("Instructor created successfully");
  });

  it("should log message if instructor already exists", async () => {
    const mockInstructor = { email: "satoru@email.com" };
    jest.spyOn(Instructor,"findOne").mockResolvedValueOnce(mockInstructor); // Instructor found

    await createInstructor();

    expect(Instructor.findOne).toHaveBeenCalledWith({
      email: "satoru@email.com",
    });
    expect(Instructor.create).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Instructor already exists");
  });

  it("should log error if creation fails", async () => {
    const mockError = new Error("Creation failed");
    jest.spyOn(Instructor,"findOne").mockResolvedValueOnce(null); // No instructor found
    jest.spyOn(Instructor,"create").mockRejectedValueOnce(mockError);

    await createInstructor();

    expect(Instructor.findOne).toHaveBeenCalledWith({
      email: "satoru@email.com",
    });
    expect(Instructor.create).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      "Error creating instructor:",
      mockError
    );
  });
});
