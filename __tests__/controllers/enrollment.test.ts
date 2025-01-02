import { cancelEnrollment, enrollStudent, getEnrollmentsForCourse, getEnrollmentsForStudent } from "../../controller/enrollment_controller";
import Enrollment from "../../models/Enrollment";
import { Request, Response } from "express";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import Course from "../../models/Course";
import Student from "../../models/Student";

// Mocking necessary modules
jest.mock("../../models/Enrollment");
jest.mock("../../models/Course");
jest.mock("../../models/Student");
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("cancelEnrollment function", () => {
  let mockRequest: any;
  let mockResponse:any;

  beforeEach(() => {
    mockRequest = {
      params: { enrollmentId: "enrollmentId1" },
      user: { id: "001", modelType: "Student" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should cancel or delete an enrollment successfully", async () => {
    const mockEnrollment = {
      _id: "enrollmentId1",
      studentId: "001",
      courseCode: "COE101",
      enrollmentDate: new Date(),
    };

    // Mock Mongoose methods
    jest.spyOn(Enrollment, "findById").mockResolvedValueOnce(mockEnrollment);
    jest.spyOn(Enrollment,"findByIdAndDelete").mockResolvedValueOnce(
      mockEnrollment 
    );

    await cancelEnrollment(mockRequest as Request, mockResponse as Response);

    // Assertions for the service calls
    expect(Enrollment.findById).toHaveBeenCalledWith("enrollmentId1");
    expect(Enrollment.findById).toHaveBeenCalledTimes(1);
    expect(Enrollment.findByIdAndDelete).toHaveBeenCalledWith("enrollmentId1");
    expect(Enrollment.findByIdAndDelete).toHaveBeenCalledTimes(1);

    // Assertions for the response
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Enrollment canceled successfully",
    });
  });
  it("should return 404 if enrollment is not found", async () => {
    jest.spyOn(Enrollment,"findById").mockResolvedValue(null); // Mock no enrollment found

    await cancelEnrollment(mockRequest as Request, mockResponse as Response);

    expect(Enrollment.findById).toHaveBeenCalledWith("enrollmentId1");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Enrollment not found",
    });
  });

  it("should return 403 if user is unauthorized to cancel the enrollment", async () => {
    const mockEnrollment = {
      _id: "enrollmentId1",
      studentId: "002", // Different student ID
      courseCode: "COE101",
      enrollmentDate: new Date(),
    };

    jest.spyOn(Enrollment,"findById").mockResolvedValue(mockEnrollment);

    await cancelEnrollment(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You are not authorized to enroll this student",
    });
  });

  it("should return 500 if there is an error during database operations", async () => {
    jest.spyOn(Enrollment,"findById").mockRejectedValue(
      new Error("Database error")
    );

    await cancelEnrollment(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error canceling enrollment",
      error: expect.anything(),
    });
  });

  it("should handle  enrollment found but not deleted", async () => {
    const mockEnrollment = {
      _id: "enrollmentId1",
      studentId: "001",
      courseCode: "COE101",
      enrollmentDate: new Date(),
    };

    jest.spyOn(Enrollment,"findById").mockResolvedValue(mockEnrollment);
    jest.spyOn(Enrollment,"findByIdAndDelete").mockResolvedValue(null); // Mock no deletion

    await cancelEnrollment(mockRequest as Request, mockResponse as Response);

    expect(Enrollment.findByIdAndDelete).toHaveBeenCalledWith("enrollmentId1");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Enrollment not found",
    });
  });
});

describe("enrollStudent function", () => {
  let mockRequest:any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      body: { studentId: "001", courseCode: "COE101" },
      user: { id: "001", modelType: "Student" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should enroll a student successfully", async () => {
    jest.spyOn(Student, "findById").mockResolvedValueOnce({ _id: "001" });
    jest
      .spyOn(Course, "findOne")
      .mockResolvedValueOnce({ courseCode: "COE101" });
    jest.spyOn(Enrollment, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(Enrollment, "create").mockResolvedValueOnce({
      _id: "enrollmentId1",
      studentId: "001",
      courseCode: "COE101",
    } as any);

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(Student.findById).toHaveBeenCalledWith("001");
    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "COE101" });
    expect(Enrollment.findOne).toHaveBeenCalledWith({
      studentId: "001",
      courseCode: "COE101",
    });
    expect(Enrollment.create).toHaveBeenCalledWith({
      studentId: "001",
      courseCode: "COE101",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student enrolled successfully",
      enrollment: expect.anything(),
    });
  });

  it("should return 404 if student is not found", async () => {
    jest.spyOn(Student, "findById").mockResolvedValueOnce(null);

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(Student.findById).toHaveBeenCalledWith("001");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student not found",
    });
  });

  it("should return 404 if course is not found", async () => {
    jest.spyOn(Student, "findById").mockResolvedValueOnce({ _id: "001" });
    jest.spyOn(Course, "findOne").mockResolvedValueOnce(null);

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "COE101" });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Course not found",
    });
  });

   it("should return 403 if user is unauthorized to enroll the student", async () => {
     jest.spyOn(Student, "findById").mockResolvedValueOnce({ _id: "002" });
     jest
       .spyOn(Course, "findOne")
       .mockResolvedValueOnce({ courseCode: "COE101" });;

     await enrollStudent(mockRequest as Request, mockResponse as Response);

     expect(mockResponse.status).toHaveBeenCalledWith(403);
     expect(mockResponse.json).toHaveBeenCalledWith({
       message: "You are not authorized to enroll this student",
     });
   });

  it("should return 400 if the student is already enrolled", async () => {
    jest.spyOn(Student, "findById").mockResolvedValueOnce({ _id: "001" });
    jest
      .spyOn(Course, "findOne")
      .mockResolvedValueOnce({ courseCode: "COE101" });
    jest.spyOn(Enrollment, "findOne").mockResolvedValueOnce({
      _id: "enrollmentId1",
    });

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(Enrollment.findOne).toHaveBeenCalledWith({
      studentId: "001",
      courseCode: "COE101",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student is already enrolled in this course",
    });
  });

  it("should return 500 if enrollment creation fails", async () => {
    jest.spyOn(Student, "findById").mockResolvedValueOnce({ _id: "001" });
    jest
      .spyOn(Course, "findOne")
      .mockResolvedValueOnce({ courseCode: "COE101" });
    jest.spyOn(Enrollment, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(Enrollment, "create").mockResolvedValueOnce(null as never);

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(Enrollment.create).toHaveBeenCalledWith({
      studentId: "001",
      courseCode: "COE101",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Failed to enroll student",
    });
  });

  it("should handle database errors", async () => {
    jest
      .spyOn(Student, "findById")
      .mockRejectedValueOnce(new Error("Database error"));

    await enrollStudent(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error enrolling student",
      error: expect.anything(),
    });
  });
});

describe("getEnrollmentsForStudent function", () => {
  let mockRequest:any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: { studentId: "001" },
      user: { id: "001", modelType: "Student" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should retrieve enrollments successfully for a student", async () => {
    const mockEnrollments = [
      { _id: "enrollment1", studentId: "001", courseCode: "COE101" },
      { _id: "enrollment2", studentId: "001", courseCode: "COE102" },
    ];

    jest.spyOn(Enrollment, "find").mockResolvedValueOnce(mockEnrollments);

    await getEnrollmentsForStudent(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(Enrollment.find).toHaveBeenCalledWith({ studentId: "001" });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockEnrollments);
  });

  it("should return 404 if no enrollments are found", async () => {
    jest.spyOn(Enrollment, "find").mockResolvedValueOnce([]);

    await getEnrollmentsForStudent(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(Enrollment.find).toHaveBeenCalledWith({ studentId: "001" });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No enrollments found for this student",
    });
  });

  it("should return 403 if the user is unauthorized to view enrollments", async () => {
    const mockEnrollments = [
      { _id: "enrollment1", studentId: "002", courseCode: "COE101" },
    ];

    mockRequest.user = { id: "001", modelType: "Student" };
    jest.spyOn(Enrollment, "find").mockResolvedValueOnce(mockEnrollments);

    await getEnrollmentsForStudent(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You are not authorized to see this data",
    });
  });

  it("should return 500 if there is a database error", async () => {
    jest
      .spyOn(Enrollment, "find")
      .mockRejectedValueOnce(new Error("Database error"));

    await getEnrollmentsForStudent(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error retrieving enrollments",
      error: expect.anything(),
    });
  });
});

describe("getEnrollmentsForCourse function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: { courseCode: "COE101" },
      query: { page: "1", limit: "10" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should retrieve enrollments for a course with valid pagination", async () => {
    const mockEnrollments = [
      {
        _id: "enroll1",
        studentId: { name: "John Doe", email: "john@email.com" },
      },
      {
        _id: "enroll2",
        studentId: { name: "Jane Smith", email: "jane@email.com" },
      },
    ];

    jest.spyOn(Enrollment, "find").mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(mockEnrollments as never),
    } as any);

    jest.spyOn(Enrollment, "countDocuments").mockResolvedValueOnce(20);

    await getEnrollmentsForCourse(
      mockRequest as Request,
      mockResponse as Response
    );
   
    expect(Enrollment.find).toHaveBeenCalledWith({ courseCode: "COE101" });
    expect(Enrollment.find).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockEnrollments,
      pagination: {
        total: 20,
        currentPage: 1,
        totalPages: 2,
        perPage: 10,
      },
    });
  });
   it("should use default page and limit values if they are not provided", async () => {
     mockRequest.query = {}; // No page or limit in the query

     const mockEnrollments = [
       {
         _id: "enroll1",
         studentId: { name: "John Doe", email: "john@email.com" },
       },
     ];

     jest.spyOn(Enrollment, "find").mockReturnValueOnce({
       populate: jest.fn().mockReturnThis(),
       skip: jest.fn().mockReturnThis(),
       limit: jest.fn().mockReturnThis(),
       exec: jest.fn().mockResolvedValueOnce(mockEnrollments as never),
     } as any);

     jest.spyOn(Enrollment, "countDocuments").mockResolvedValueOnce(10); // Total count

     await getEnrollmentsForCourse(
       mockRequest as Request,
       mockResponse as Response
     );

     expect(Enrollment.find).toHaveBeenCalled();
     expect(mockResponse.status).toHaveBeenCalledWith(200);
     expect(mockResponse.json).toHaveBeenCalledWith({
       success: true,
       data: mockEnrollments,
       pagination: {
         total: 10,
         currentPage: 1,
         totalPages: 1,
         perPage: 10,
       },
     });
   });

  it("should return 404 if no enrollments are found", async () => {
    jest.spyOn(Enrollment, "find").mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce([] as never),
    } as any);

    await getEnrollmentsForCourse(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(Enrollment.find).toHaveBeenCalledWith({ courseCode: "COE101" });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No enrollments found for this course",
    });
  });

  it("should return 400 for invalid pagination parameters", async () => {
    mockRequest.query = { page: "0", limit: "-10" }; // Invalid parameters

    await getEnrollmentsForCourse(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Page and limit must be positive integers.",
    });
  });

  it("should return 500 if there is a database error", async () => {
        jest.spyOn(Enrollment, "find").mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockImplementationOnce(()=> Promise.reject(new Error("Database error"))),
    } as any);

    await getEnrollmentsForCourse(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error retrieving enrollments",
      error: expect.anything(),
    });
  });
});