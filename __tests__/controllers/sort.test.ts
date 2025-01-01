import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import {
  getSortedCourses,
  getSortedStudents,
} from "../../controller/sort_controller";
import Student from "../../models/Student";
import redisClient from "../../utils/redis_client";
import { isFieldValid, isValidOrder } from "../../helpers/helper";
import Course from "../../models/Course";

jest.mock("../../models/Student");
jest.mock("../../utils/redis_client");
jest.mock("../../helpers/helper", () => ({
  isFieldValid: jest.fn(),
  isValidOrder: jest.fn(),
}));
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../utils/redis_client", () => ({
  connect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  on: jest.fn(),
}));

describe("getSortedStudents function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      query: { field: "title", order: "asc" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return an error if the field parameter is invalid", async () => {
    (isFieldValid as jest.Mock).mockReturnValueOnce(false);

    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Invalid field parameter: title. Please provide a valid field.",
    });
  });

  it("should return an error if the order parameter is invalid", async () => {
    mockRequest.query.order = "invalid";
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(false);

    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        "Invalid order parameter: invalid. Valid values are 'asc' or 'desc'.",
    });
  });

  it("should return cached data if available in Redis", async () => {
    const cachedData = JSON.stringify({
      field: "title",
      order: "asc",
      data: [{ id: "1", title: "Alice" }],
    });
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    jest
      .spyOn(redisClient, "get")
      .mockImplementationOnce(() => Promise.resolve(cachedData));

    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(redisClient.get).toHaveBeenCalledWith("students:sorted:title:asc");
    expect(mockResponse.json).toHaveBeenCalledWith(JSON.parse(cachedData));
  });

  it("should return a 404 if no students are found", async () => {
    (redisClient.get as jest.Mock).mockResolvedValueOnce(null as never);
    jest.spyOn(Student, "find").mockResolvedValueOnce([]);
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No students found",
    });
  });

  it("should fetch, sort, and cache student data from the database", async () => {
    const mockStudents = [
      { _id: "1", title: "Alice" },
      { _id: "2", title: "Bob" },
    ];
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(null);
    jest.spyOn(Student, "find").mockResolvedValueOnce(mockStudents as any);
    jest.spyOn(redisClient, "set").mockResolvedValueOnce(null);

    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith(
      "students:sorted:title:asc",
      JSON.stringify({
        field: "title",
        order: "asc",
        data: [
          { id: "1", title: "Alice" },
          { id: "2", title: "Bob" },
        ],
      }),
      { EX: 60 }
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      field: "title",
      order: "asc",
      data: [
        { id: "1", title: "Alice" },
        { id: "2", title: "Bob" },
      ],
    });
  });

  it("should handle descending order sorting correctly", async () => {
    const mockStudents = [
      { _id: "1", title: "Alice" },
      { _id: "2", title: "Bob" },
    ];
    mockRequest.query.order = "desc";
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(null);
    jest.spyOn(Student, "find").mockResolvedValueOnce(mockStudents);

    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalledWith({
      field: "title",
      order: "desc",
      data: [
        { id: "2", title: "Bob" },
        { id: "1", title: "Alice" },
      ],
    });
  });

  it("should return a 500 error if an exception occurs", async () => {
    jest
      .spyOn(redisClient, "get")
      .mockRejectedValueOnce(new Error("Redis error"));
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    await getSortedStudents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error sorting students",
      error: expect.anything(),
    });
  });
});

describe("getSortedCourses function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      query: { field: "courseCode", order: "asc" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return an error if the field parameter is invalid", async () => {
    (isFieldValid as jest.Mock).mockReturnValueOnce(false); // Invalid field

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        "Invalid field parameter: courseCode. Please provide a valid field.",
    });
  });

  it("should return an error if the order parameter is invalid", async () => {
    mockRequest.query.order = "invalid";
    (isFieldValid as jest.Mock).mockReturnValueOnce(true); // Valid field
    (isValidOrder as jest.Mock).mockReturnValueOnce(false); // Invalid order

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        "Invalid order parameter: invalid. Valid values are 'asc' or 'desc'.",
    });
  });

  it("should return cached data if available in Redis", async () => {
    const cachedData = JSON.stringify({
      field: "courseCode",
      order: "asc",
      data: [{ id: "1", courseCode: "CS101" }],
    });

    // Simulate a cache hit
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(cachedData);
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(redisClient.get).toHaveBeenCalledWith(
      "courses:sorted:courseCode:asc"
    );
    expect(mockResponse.json).toHaveBeenCalledWith(JSON.parse(cachedData));
  });
    // it("should throw an error if an exception occurs when there is a connection error with Redis", async () => {
  
    // });


  it("should return a 404 if no courses are found", async () => {
    // Simulate a cache miss and empty course data
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(null);
    jest.spyOn(Course, "find").mockResolvedValueOnce([]);
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No courses found",
    });
  });

  it("should fetch, sort, and cache course data in accending order", async () => {
    const mockCourses = [
      { _id: "1", courseCode: "CS101" },
      { _id: "2", courseCode: "CS102" },
    ];
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);
    // Simulate a cache miss
    jest.spyOn(redisClient, "get").mockResolvedValueOnce(null);

    // Mock the database query
    jest.spyOn(Course, "find").mockResolvedValueOnce(mockCourses);

    // Mock Redis set
    jest.spyOn(redisClient, "set").mockResolvedValueOnce(null);

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalled();
    expect(redisClient.set).toHaveBeenCalledWith(
      "courses:sorted:courseCode:asc",
      JSON.stringify({
        field: "courseCode",
        order: "asc",
        data: [
          { id: "1", courseCode: "CS101" },
          { id: "2", courseCode: "CS102" },
        ],
      }),
      { EX: 60 }
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      field: "courseCode",
      order: "asc",
      data: [
        { id: "1", courseCode: "CS101" },
        { id: "2", courseCode: "CS102" },
      ],
    });
  });
  
  it("should handle errors and return a 500 response", async () => {
    // Simulate a Redis error
    jest
      .spyOn(redisClient, "get")
      .mockRejectedValueOnce(new Error("Redis error"));
    (isFieldValid as jest.Mock).mockReturnValueOnce(true);
    (isValidOrder as jest.Mock).mockReturnValueOnce(true);

    await getSortedCourses(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error sorting courses",
      error: expect.any(Error),
    });
  });


});

