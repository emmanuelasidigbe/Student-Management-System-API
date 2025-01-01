import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { executeValidator } from "../../../middleware/validators/execute.validator";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

jest.mock("../../../utils/logger", () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
}));

describe("executeValidator Function", () => {
  let mockRequest: any;
  let mockResponse:any;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();

    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: jest.fn(),
      array: jest.fn(),
    });
  });

  it("should log and return 400 if there are validation errors", () => {
    // Mock validation errors
    const mockErrors = [
      { msg: "Name is required" },
      { msg: "Gender must be one of: MALE, FEMALE, OTHER" },
    ];

    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: jest.fn().mockReturnValue(false), // Validation has errors
      array: jest.fn().mockReturnValue(mockErrors),
    });

    executeValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errorMessage:
        "Name is required\nGender must be one of: MALE, FEMALE, OTHER",
    });

    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should log and call next if there are no validation errors", () => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
      isEmpty: jest.fn().mockReturnValue(true), // No validation errors
      array: jest.fn(),
    });

    executeValidator(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
