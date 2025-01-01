import { beforeEach, describe, expect, it, jest, test } from "@jest/globals";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../../controller/student_controller";
import { Request, Response } from "express";
import Student from "../../models/Student";
import logger from "../../utils/logger";

const mockStudent = {
  _id: "001",
  name: "emmanuel",
  email: "emma@email.com",
  password: "emma",
  modelType: "Student",
  grade: 3,
  residence: "klsajdf",
  gender: "Male",
  phone: "1234",
  dateOfBirth: "2024-1-10",
};
const mockStudents = [
  {
    _id: "studentId1",
    name: "John Doe",
    grade: 5,
    gender: "Male",
    residence: "Sample Location",
  },
  {
    _id: "studentId2",
    name: "Jane Smith",
    grade: 4,
    gender: "Female",
    residence: "Another Location",
  },
  {
  _id: "001",
  name: "emmanuel",
  grade: 3,
  residence: "klsajdf",
  gender: "Male",
 
}
];
jest.mock("../../models/Student");
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const mockedStudentModel = Student as jest.Mocked<typeof Student>;

describe("create student function", () => {
  let mockRequest: any;
  let mockResponse: any;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {}; // Reset response capture object before each test

    mockRequest = {
      params: { id: "001" },
      body: mockStudent,
    };

    mockResponse = {
      status: jest.fn().mockImplementation((code: any) => {
        responseObject.statusCode = code;
        return mockResponse as Response;
      }),
      json: jest.fn().mockImplementation((data: any) => {
        responseObject.body = data;
        return mockResponse as Response;
      }),
    } as Partial<Response>;
  });

  it("creates and returns student and status 201", async () => {
    jest.spyOn(Student, "create").mockResolvedValueOnce(mockStudent as any);
    await createStudent(mockRequest as Request, mockResponse as Response);
    expect(Student.create).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenLastCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockStudent,
    });
  });

  it("should return 500 for...", async () => {
    jest
      .spyOn(Student, "create")
      .mockImplementationOnce(() => Promise.reject("Failed to create student"));
    expect(mockRequest.body).toBe(mockStudent);
    await createStudent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Server error",
    });
  });
});

describe("getStudentById Controller Function", () => {
  let mockRequest: any;
  let mockResponse: any;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {}; // Reset response capture object before each test

    mockRequest = {
      params: { id: "001" },
      user: { id: "001", modelType: "Student" },
    };

    mockResponse = {
      status: jest.fn().mockImplementation((code: any) => {
        responseObject.statusCode = code;
        return mockResponse as Response;
      }),
      json: jest.fn().mockImplementation((data: any) => {
        responseObject.body = data;
        return mockResponse as Response;
      }),
    } as Partial<Response>;

    mockedStudentModel.findById.mockResolvedValue(mockStudent as any);
  });

  it("returns status 404 for student not found", async () => {
    // Mock findById to return null
    mockedStudentModel.findById.mockResolvedValueOnce(null);

    await getStudentById(mockRequest as Request, mockResponse as Response);

    expect(Student.findById).toHaveBeenCalledWith("001");
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student not found",
    });
  });

  it("should return return 403 for unathorized user", async () => {
    mockRequest.user.id = "hello";
    await getStudentById(mockRequest as Request, mockResponse as Response);

    expect(Student.findById).toHaveBeenCalledTimes(1);
    expect(Student.findById).toHaveBeenCalledWith("001");
    expect(mockResponse.status).toHaveBeenCalledWith(403);

    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You are not authorized to see this data",
    });
  });

  it("should retrieve a student when student ID is passed as params", async () => {

    await getStudentById(mockRequest as Request, mockResponse as Response);

    expect(Student.findById).toHaveBeenCalledTimes(1);
    expect(Student.findById).toHaveBeenCalledWith("001");
    expect(mockResponse.status).toHaveBeenCalledWith(200);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockStudent,
    });
  });

  
  it("should return status 500 if an error occurs", async () => {
    // Mocking Student.findById to throw an error
    mockedStudentModel.findById.mockRejectedValueOnce(
      new Error("Database error")
    );

    await getStudentById(mockRequest as Request, mockResponse as Response);

    expect(logger.error).toHaveBeenCalledWith(
      "Error retrieving student:",
      expect.any(Error)
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith("error retrieving student");
  });
});

describe("deleteStudent function", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {}; // Reset response object before each test
    mockRequest = {
      params: { id: "001" },
    };
    mockResponse = {
      status: jest.fn().mockImplementation((code: any) => {
        responseObject.statusCode = code;
        return mockResponse as Response; // Enable chaining
      }),
      json: jest.fn().mockImplementation((data: any) => {
        responseObject.body = data;
        return mockResponse as Response; // Enable chaining
      }),
    } as Partial<Response>;
  });

  it("should delete a student and return the deleted student data", async () => {
    // Mock Student.findByIdAndDelete to return the deleted student
    mockedStudentModel.findByIdAndDelete.mockResolvedValueOnce(
      mockStudent as any
    );

    await deleteStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith(
      "Attempting to delete student with ID:",
      "001"
    );

    expect(Student.findByIdAndDelete).toHaveBeenCalledWith("001");

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: mockStudent,
    });
  });

  it("should return status 404 if the student is not found", async () => {
    // Mock Student.findByIdAndDelete to return null
    mockedStudentModel.findByIdAndDelete.mockResolvedValueOnce(null);

    await deleteStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.warn).toHaveBeenCalledWith(
      "Student with ID 001 not found. Delete operation failed."
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student not found",
    });
  });

  it("should return status 500 if an error occurs", async () => {
    // Mock Student.findByIdAndDelete to throw an error
    mockedStudentModel.findByIdAndDelete.mockRejectedValueOnce(
      new Error("Database error")
    );

    await deleteStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.error).toHaveBeenCalledWith(
      `Error deleting student with ID 001: Error: Database error`,
      { error: expect.any(Error) }
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Server error",
    });
  });
});

describe("getStudents function", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: any;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return paginated students matching query parameters", async () => {
   
    jest.spyOn(Student, "find").mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockStudents as never),
      } as any;
    });
    jest.spyOn(Student, "countDocuments").mockResolvedValueOnce(2);

    mockRequest.query = { page: "1", limit: "2", name: "John", grade: "5" };

    await getStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalledWith(
      expect.objectContaining({
        name: expect.any(Object),
        grade: 5,
      })
    );
    expect(Student.find).toHaveBeenCalledTimes(1)
    expect(Student.countDocuments).toHaveBeenCalledTimes(1);
    expect(Student.countDocuments).toHaveBeenCalledWith(expect.any(Object));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: mockStudents,
        pagination: expect.any(Object),
      })
    );
  });

  it("should handle no students found case", async () => {
    jest.spyOn(Student, "find").mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([] as never),
      } as any;
    });
    jest.spyOn(Student, "countDocuments").mockResolvedValueOnce(0);

    mockRequest.query = { page: "1", limit: "2" };

    await getStudents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No students found",
    });
  });

  it("should handle errors thrown during query execution", async () => {
    jest.spyOn(Student, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    mockRequest.query = {};

    await getStudents(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Error retrieving students",
    });
  });

  it("should handle pagination and limit defaults correctly", async () => {

    jest.spyOn(Student, "find").mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockStudents as never),
      } as any;
    });
    jest.spyOn(Student, "countDocuments").mockResolvedValueOnce(1);

    mockRequest.query = {};

    await getStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalledWith(expect.objectContaining({}));
    expect(Student.find).toHaveBeenCalledWith(expect.any(Object));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          totalPages: 1,
        }),
      })
    );
  });

  it("should filter by minGrade and maxGrade", async () => {

    jest.spyOn(Student, "find").mockImplementation(() => {
      return {
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockStudents as never),
      } as any;
    });
    jest.spyOn(Student, "countDocuments").mockResolvedValueOnce(1);

    mockRequest.query = { minGrade: "4", maxGrade: "6" };

    await getStudents(mockRequest as Request, mockResponse as Response);

    expect(Student.find).toHaveBeenCalledWith(
      expect.objectContaining({
        grade: { $gte: 4, $lte: 6 },
      })
    );
  });

    it("should filter by gender", async () => {
      jest.spyOn(Student, "find").mockResolvedValueOnce(mockStudents as any);
      jest.spyOn(Student, "countDocuments").mockResolvedValueOnce(1);

      mockRequest.query = { gender: "Male" };

      await getStudents(mockRequest as Request, mockResponse as Response);

      expect(Student.find).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: "Male",
        })
      );
    });
});
describe("updateStudent function", () => {
  let mockRequest: any;
  let mockResponse: any;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {};
    mockRequest = {
      params: { id: "001" },
      body: { name: "Updated Name", grade: 6 },
      user: { modelType: "Student", _id: "002" }, // Mock a student attempting to update another student's data
    };

    mockResponse = {
      status: jest.fn().mockImplementation((code: any) => {
        responseObject.statusCode = code;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation((data: any) => {
        responseObject.body = data;
        return mockResponse;
      }),
    } as Partial<Response>;
  });

  it("should update and return the student when an instructor performs the update", async () => {
    mockRequest.user = { modelType: "Instructor", _id: "instructor001" }; // Instructor performs the update
    mockedStudentModel.findById.mockResolvedValueOnce({ _id: "001" });
    mockedStudentModel.findByIdAndUpdate.mockResolvedValueOnce({
      _id: "001",
      name: "Updated Name",
      grade: 6,
    } as any);

    await updateStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.info).toHaveBeenCalledWith(
      "Attempting to update student with ID:",
      "001"
    );

    expect(Student.findByIdAndUpdate).toHaveBeenCalledWith(
      "001",
      { name: "Updated Name", grade: 6 },
      { new: true, runValidators: true }
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: { _id: "001", name: "Updated Name", grade: 6 },
    });
  });

  it("should return status 403 if a student tries to update another student's data", async () => {
    // Simulate a fetched student with ID different from the user's ID
    mockedStudentModel.findById.mockResolvedValueOnce({ _id: "001" });

    await updateStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.warn).toHaveBeenCalledWith(
      "You are not authorized to update this student"
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You are not authorized to update this student",
    });
  });

  it("should return status 404 if the student is not found", async () => {
    mockedStudentModel.findById.mockResolvedValueOnce(null);

    await updateStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.warn).toHaveBeenCalledWith(
      "Student with ID 001 not found. Update operation failed."
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Student not found",
    });
  });

  it("should return status 500 if an error occurs", async () => {
    mockedStudentModel.findById.mockRejectedValueOnce(
      new Error("Database error")
    );

    await updateStudent(mockRequest as Request, mockResponse as Response);

    expect(logger.error).toHaveBeenCalledWith(
      "Error updating student:",
      expect.any(Error)
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Server error while updating student",
    });
  });
});


