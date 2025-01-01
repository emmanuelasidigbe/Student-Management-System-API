
import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { verifyToken, verifyTokenAndInstructor } from "../../../middleware/auth/auth_middleware";
import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
describe("verifyToken Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should return 401 if Authorization header is missing", async () => {
     verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header does not start with Bearer", async () => {
    mockRequest.headers.authorization = "InvalidToken";

    await verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

   it("should return 403 if token is invalid or expired", async () => {
     mockRequest.headers.authorization = "Bearer invalidToken";

     // Mock JWT verification failure
     (jwt.verify as jest.Mock).mockImplementationOnce(
       (token, secret, callback: any) => {
         callback(new jwt.JsonWebTokenError("Invalid or expired token"), null);
       }
     );

     verifyToken(
       mockRequest as Request,
       mockResponse as Response,
       nextFunction
     );

     expect(mockResponse.status).toHaveBeenCalledWith(403);
     expect(mockResponse.json).toHaveBeenCalledWith({
       success: false,
       message: "Invalid or expired token",
     });
     expect(nextFunction).not.toHaveBeenCalled();
   });

  it("should call next if token is valid", async () => {
    mockRequest.headers.authorization = "Bearer validToken";

    const mockDecoded = { id: "123", role: "user" };
    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback: any) => {
        callback(null, mockDecoded);
      }
    );
     verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect((mockRequest as any).user).toEqual(mockDecoded);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    mockRequest.headers.authorization = "Bearer Token";
    const mockError = new Error("Unexpected error");
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw mockError;
    });

    await verifyToken(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  });

describe("verifyTokenAndInstructor Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it("should return 401 if Authorization header is missing", async () => {
    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if Authorization header does not start with Bearer", async () => {
    mockRequest.headers.authorization = "InvalidToken";

    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: No token provided",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 403 if token is invalid or expired", async () => {
    mockRequest.headers.authorization = "Bearer invalidToken";

    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback: any) => {
        callback(new jwt.JsonWebTokenError("Invalid or expired token"), null);
      }
    );

    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 403 if the user is not an Instructor", async () => {
    mockRequest.headers.authorization = "Bearer validToken";

    const mockDecoded = { id: "123", modelType: "Student" };
    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback: any) => {
        callback(null, mockDecoded);
      }
    );

    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized: User is not an instructor",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should call next if the token is valid and the user is an Instructor", async () => {
    mockRequest.headers.authorization = "Bearer validToken";

    const mockDecoded = { id: "123", modelType: "Instructor" };
    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback: any) => {
        callback(null, mockDecoded);
      }
    );

    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect((mockRequest as any).user).toEqual(mockDecoded);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 500 if an unexpected error occurs", async () => {
    mockRequest.headers.authorization = "Bearer Token";
    const mockError = new Error("Unexpected error");
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw mockError;
    });

    verifyTokenAndInstructor(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});