import Course from "../../models/Course";
import {
    createCourse,
  deleteCourse,
  getCourseByCode,
  getCourses,
  updateCourse,
} from "../../controller/course_controller";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Request, Response } from "express";

jest.mock("../../models/Course");
jest.mock("../../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));
const mockCourse = {
  _id: "001",
  courseCode: "COE101",
  title: "Introduction to computer engineering",
  description:
    "This course provides an introduction to the fundamental concepts of computer engineering, including programming, algorithms, and data structures.",
  department: "Computer Engineering",
  semester: "Fall",
};

describe("getCouserById function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
      params: { courseCode: "COE101" },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 200 and course detail for a valid courseCode ", async () => {
    jest.spyOn(Course, "findOne").mockReturnValueOnce(mockCourse as any);
    await getCourseByCode(mockRequest as Request, mockResponse as Response);
    expect(Course.findOne).toHaveBeenCalledTimes(1);
    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "COE101" });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockCourse);
  });
  it("should return 404 if no course is found", async () => {
    jest.spyOn(Course, "findOne").mockResolvedValueOnce(null);

    mockRequest.params = { courseCode: "INVALID" };

    await getCourseByCode(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "INVALID" });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Course not found",
    });
  });

  it("should return 500 if an error occurs during database query", async () => {
    jest.spyOn(Course, "findOne").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    mockRequest.params = { courseCode: "CS101" };

    await getCourseByCode(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "CS101" });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server error",
    });
  });
});

describe("updateCourse function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should update the course successfully", async () => {
    const mockUpdatedCourse = {
      _id: "1",
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      credits: 4,
    };

    jest
      .spyOn(Course, "findOneAndUpdate")
      .mockResolvedValueOnce(mockUpdatedCourse as any);

    mockRequest.params = { courseCode: "CS101" };
    mockRequest.body = { credits: 4 };

    await updateCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      { courseCode: "CS101" },
      { credits: 4 },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedCourse);
  });

  it("should return 404 if no course is found to update", async () => {
    jest.spyOn(Course, "findOneAndUpdate").mockResolvedValueOnce(null);

    mockRequest.params = { courseCode: "INVALID" };
    mockRequest.body = { credits: 4 };

    await updateCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      { courseCode: "INVALID" },
      { credits: 4 },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Unable to update courser or not found",
    });
  });

  it("should return 500 if an error occurs during the update", async () => {
    jest.spyOn(Course, "findOneAndUpdate").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    mockRequest.params = { courseCode: "COE101" };
    mockRequest.body = { grade: 4 };

    await updateCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndUpdate).toHaveBeenCalledWith(
      { courseCode: "COE101" },
      { grade: 4 },
      { new: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server error",
    });
  });
});

describe("deleteCourse function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should delete a course successfully for a valid courseCode", async () => {
    jest
      .spyOn(Course, "findOneAndDelete")
      .mockResolvedValueOnce(mockCourse as any);

    mockRequest.params = { courseCode: "COE101" };

    await deleteCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndDelete).toHaveBeenCalledWith({
      courseCode: "COE101",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Course removed successfully",
    });
  });

  it("should return 404 if the course is not found", async () => {
    jest.spyOn(Course, "findOneAndDelete").mockResolvedValueOnce(null);

    mockRequest.params = { courseCode: "INVALID" };

    await deleteCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndDelete).toHaveBeenCalledWith({
      courseCode: "INVALID",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Course not found",
    });
  });

  it("should return 500 if an error occurs during the deletion process", async () => {
    jest.spyOn(Course, "findOneAndDelete").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    mockRequest.params = { courseCode: "COE101" };

    await deleteCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOneAndDelete).toHaveBeenCalledWith({
      courseCode: "COE101",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});

describe("createCourse function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {};

mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
   
  });


  it("should create a course successfully for valid data", async () => {
    const mockCourse = {
      _id: "1",
      courseCode: "CS101",
      title: "Introduction to Computer Science",
      description: "An introductory course for computer science",
      department: "Computer Science",
      semester: "Fall 2024",
    };

    jest.spyOn(Course, "findOne").mockResolvedValueOnce(null);
    jest.spyOn(Course, "create").mockResolvedValueOnce(mockCourse as any);

    mockRequest.body = {
      courseCode: "CS101",
      title: "Introduction to Computer Science",
      description: "An introductory course for computer science",
      department: "Computer Science",
      semester: "Fall 2024",
    };

    await createCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "CS101" });
    expect(Course.create).toHaveBeenCalledWith({
      courseCode: "CS101",
      title: "Introduction to Computer Science",
      description: "An introductory course for computer science",
      department: "Computer Science",
      semester: "Fall 2024",
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(mockCourse);
  });

  it("should return 400 if the courseCode already exists", async () => {
    const existingCourse = {
      _id: "1",
      courseCode: "CS101",
      title: "Existing Course",
    };

    jest.spyOn(Course, "findOne").mockResolvedValueOnce(existingCourse as any);

    mockRequest.body = {
      courseCode: "CS101",
      title: "Introduction to Computer Science",
    };

    await createCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "CS101" });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Course with this courseCode already exists",
    });
  });

  it("should return 500 if there is a server error", async () => {
    jest.spyOn(Course, "findOne").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    mockRequest.body = {
      courseCode: "CS101",
      title: "Introduction to Computer Science",
    };

    await createCourse(mockRequest as Request, mockResponse as Response);

    expect(Course.findOne).toHaveBeenCalledWith({ courseCode: "CS101" });
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server error",
    });
  });
});

describe("getCourses function", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = {
        query:{}
    };

mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

  });



  it("should return all courses without any filter", async () => {
    const mockCourses = [
      {
        courseCode: "CS101",
        title: "Introduction to CS",
        department: "CS",
        semester: 1,
      },
      {
        courseCode: "CS102",
        title: "Data Structures",
        department: "CS",
        semester: 2,
      },
    ];

    jest.spyOn(Course, "find").mockResolvedValueOnce(mockCourses as any);

    await getCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalledWith({});
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Courses retrieved successfully",
      appliedFilter: {},
      data: mockCourses,
    });
  });

  it("should return filtered courses based on department", async () => {
    const mockCourses = [
      {
        courseCode: "CS101",
        title: "Introduction to CS",
        department: "CS",
        semester: 1,
      },
    ];

    jest.spyOn(Course, "find").mockResolvedValueOnce(mockCourses as any);

    mockRequest.query = { department: "CS" };

    await getCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalledWith({ department: { $regex: /CS/i } });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Courses retrieved successfully",
      appliedFilter: { department: "CS" },
      data: mockCourses,
    });
  });

  it("should return filtered courses based on semester", async () => {
    const mockCourses = [
      {
        courseCode: "CS101",
        title: "Introduction to CS",
        department: "CS",
        semester: 1,
      },
    ];

    jest.spyOn(Course, "find").mockResolvedValueOnce(mockCourses as any);

    mockRequest.query = { semester: "1" };

    await getCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalledWith({ semester: { $regex: /1/i } });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Courses retrieved successfully",
      appliedFilter: { semester: "1" },
      data: mockCourses,
    });
  });

  it("should return 404 if no courses are found", async () => {
    jest.spyOn(Course, "find").mockResolvedValueOnce([]);

    mockRequest.query = { department: "INVALID" };

    await getCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalledWith({
      department: { $regex: /INVALID/i },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "No courses found",
      appliedFilter: { department: "INVALID" },
    });
  });

  it("should return 500 if an error occurs during retrieval", async () => {
    jest.spyOn(Course, "find").mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    await getCourses(mockRequest as Request, mockResponse as Response);

    expect(Course.find).toHaveBeenCalledWith({});
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Internal Server error",
    });
  });
});