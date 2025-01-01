import {
  Login,
  RequestPasswordReset,
  ResetPassword,
} from "../../controller/auth_controller";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { query, Request, Response } from "express";
import BaseUser from "../../models/BaseUser"; // Import User model
import { compare, hash } from "bcrypt"; // Import bcrypt comparison
import jwt from "jsonwebtoken"; // Import jwt for token generation

// Mock the necessary modules
jest.mock("../../models/BaseUser");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("Login function", () => {
  let mockRequest: any;
  let mockResponse: any;

  // Setup the mockRequest and mockResponse before each test
  beforeEach(() => {
    mockRequest = {
      body: {
        email: "test@example.com", // Default valid email
        password: "password123", // Default valid password
      },
    } as Request;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it("should return error if email is invalid", async () => {
    mockRequest.body.email = ""; // Invalid email

    await Login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Email or Password is required",
    });
  });

  it("should return error if password is missing", async () => {
    mockRequest.body.password = ""; // Missing password

    await Login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Email or Password is required",
    });
  });

  it("should return error if user does not exist", async () => {
    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(null); // Simulate no user found

    await Login(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("should return error if password is incorrect", async () => {
    const mockUser = {
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
      modelType: "Student",
    };

    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(mockUser);
    (compare as jest.Mock).mockResolvedValueOnce(false as never); // Simulate password mismatch

    await Login(mockRequest, mockResponse);

    expect(compare).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("should return JWT token and user info on successful login", async () => {
    const mockUser = {
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
      modelType: "Student",
    };

    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(mockUser);
    (compare as jest.Mock).mockResolvedValueOnce(true as never); // Simulate password match
    (jwt.sign as jest.Mock).mockReturnValueOnce("jwtToken"); // Simulate JWT token generation

    await Login(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });
    expect(compare).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id, modelType: mockUser.modelType },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      token: "jwtToken",
      user: {
        id: mockUser._id,
        email: mockUser.email,
        modelType: mockUser.modelType,
      },
    });
  });

  it("should handle server errors during login", async () => {
    // Simulate database error
    jest.spyOn(BaseUser, "findOne").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    await Login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      error: expect.any(Error),
    });
  });
});

describe("ResetPassword function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      query: { token: "validToken" }, // Default valid token
      body: { newPassword: "newpassword123" }, // Default new password
    } as unknown as Response;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it("should return error if token or newPassword is missing", async () => {
    mockRequest.query.token = ""; // Missing token
    await ResetPassword(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token and new password are required",
    });

    mockRequest.query.token = "validToken";
    mockRequest.body.newPassword = ""; // Missing newPassword
    await ResetPassword(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token and new password are required",
    });
  });

  it("should return error if token is invalid or expired", async () => {
    const invalidToken = "invalidToken";
    mockRequest.query.token = invalidToken;

    // Mock JWT verification to throw error
    (jwt.verify as jest.Mock).mockImplementationOnce(() => null);

    await ResetPassword(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it("should return error if user is not found", async () => {
    const mockDecoded = { email: "test@example.com", resetPassword: true };

    (jwt.verify as jest.Mock).mockReturnValueOnce(mockDecoded); // Simulate valid token decoding

    // Simulate BaseUser model returning no user
    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(null);

    await ResetPassword(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({ email: mockDecoded.email });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
  });

  it("should reset the password and return success", async () => {
    const mockDecoded = { email: "test@example.com", resetPassword: true };

    (jwt.verify as jest.Mock).mockReturnValueOnce(mockDecoded); // Simulate valid token decoding

    const mockUser = {
      _id: "123",
      email: "test@example.com",
      password: "oldHashedPassword",
      save: jest.fn().mockResolvedValueOnce(true as never),
    };
    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(mockUser);

    // Mock bcrypt hash function
    (hash as jest.Mock).mockResolvedValueOnce("newHashedPassword" as never);

    await ResetPassword(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({ email: mockDecoded.email });
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Password reset successfully",
    });
  });

  it("should handle token expiry errors", async () => {
    const mockExpiredToken = "expiredToken";

    mockRequest.query.token = mockExpiredToken;

    // Mock JWT token expiry error
    (jwt.verify as jest.Mock).mockImplementationOnce(() => null);

    await ResetPassword(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
  });

  it("should handle server errors", async () => {
    const mockDecoded = { email: "test@example.com", resetPassword: true };

    (jwt.verify as jest.Mock).mockReturnValueOnce(mockDecoded);

    // Simulate a generic error from BaseUser.findOne
    jest
      .spyOn(BaseUser, "findOne")
      .mockRejectedValueOnce(new Error("Database error"));

    await ResetPassword(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      error: expect.any(Error),
    });
  });
});

describe("RequestPasswordReset function ", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: { email: "test@example.com" },
      query: {}, 
    } as unknown as Request;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it("should return an error if the email is missing or invalid", async () => {
    mockRequest.body.email = ""; // Missing email
    await RequestPasswordReset(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Email is required",
    });

    mockRequest.body.email = "invalidemail"; // Invalid email
    await RequestPasswordReset(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Email is required",
    });
  });

  it("should return an error if email is not found in the database", async () => {
    const mockEmail = "notfound@example.com";
    mockRequest.body.email = mockEmail;

    // Mock BaseUser.findOne to return null (email not found)
    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(null);

    await RequestPasswordReset(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Email not found",
    });
  });

  it("should generate and return a password reset token for an existing user", async () => {
    const mockEmail = "test@example.com";
    mockRequest.body.email = mockEmail;

    // Mock BaseUser.findOne to return a mock user object
    const mockUser = { email: mockEmail, _id: "12345" };
    jest.spyOn(BaseUser, "findOne").mockResolvedValueOnce(mockUser);

    // Mock jwt.sign to return a mock token
    const mockToken = "mockGeneratedToken";
    (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

    await RequestPasswordReset(mockRequest, mockResponse);

    expect(BaseUser.findOne).toHaveBeenCalledWith({ email: mockEmail });
    expect(jwt.sign).toHaveBeenCalledWith(
      { email: mockEmail, resetPassword: true },
      process.env.JWT_SECRET!, // Assuming JWT_SECRET is set in the environment variables
      { expiresIn: "1h" }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Password reset token sent",
      token: mockToken,
    });
  });

  it("should handle server errors and return an 500 status", async () => {
    const mockEmail = "test@example.com";
    mockRequest.body.email = mockEmail;

    // Simulate an error with BaseUser.findOne (database error)
    jest
      .spyOn(BaseUser, "findOne")
      .mockRejectedValueOnce(new Error("Database error"));

    await RequestPasswordReset(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
      error: expect.any(Error),
    });
  });
});
