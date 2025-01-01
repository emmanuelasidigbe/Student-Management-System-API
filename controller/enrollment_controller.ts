import { Request, Response } from "express";
import Student from "../models/Student";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import logger from "../utils/logger";

export async function enrollStudent(req: Request, res: Response) {
  const { studentId, courseCode } = req.body;
  const user = (req as any).user;
  logger.info(
    "Attempting to enroll student with ID:",
    studentId,
    "in course:",
    courseCode
  );
  try {
    // Verify Student and Course exist
    const student = await Student.findById(studentId);
    const course = await Course.findOne({ courseCode });

    if (!student) {
      logger.warn("Student not found");
      res.status(404).json({ message: "Student not found" });
      return;
    }
    if (!course) {
      logger.warn("Course not found");
      res.status(404).json({ message: "Course not found" });
      return;
    }
    if (user.modelType === "Student" && user._id !== student._id) {
      logger.warn("You are not authorized to enroll this student");
      res.status(403).json({
        message: "You are not authorized to enroll this student",
      });
      return;
    }

    // Prevent duplicate enrollments
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseCode,
    });
    if (existingEnrollment) {
      logger.warn("Student is already enrolled in this course");
      res
        .status(400)
        .json({ message: "Student is already enrolled in this course" });
      return;
    }

    // Enroll the student
    const enrollment = await Enrollment.create({ studentId, courseCode });
    if (!enrollment) {
      logger.warn("Failed to enroll student");
      res.status(500).json({ message: "Failed to enroll student" });
      return;
    }
    logger.info("Student enrolled successfully");
    res
      .status(201)
      .json({ message: "Student enrolled successfully", enrollment });
  } catch (error) {
    logger.error("Error enrolling student");
    res.status(500).json({ message: "Error enrolling student", error });
  }
}
export async function getEnrollmentsForStudent(req: Request, res: Response) {
  const { studentId } = req.params;
  const user = (req as any).user;
  logger.info(
    "Attempting to retrieve enrollments for student with ID:",
    studentId
  );
  try {
    const enrollments = await Enrollment.find({ studentId });

    if (!enrollments || enrollments.length === 0) {
      logger.warn("No enrollments found for this student");
      res
        .status(404)
        .json({ message: "No enrollments found for this student" });
      return;
    }
    if (user.modelType === "Student" && user._id !== enrollments[0].studentId) {
      logger.warn("You are not authorized to see this data");
      res.status(403).json({
        message: "You are not authorized to see this data",
      });
      return;
    }

    res.status(200).json(enrollments);
  } catch (error) {
    logger.error("Error retrieving enrollments:", error);
    res.status(500).json({ message: "Error retrieving enrollments", error });
  }
}

// GET /enrollments/course/{courseCode} - Retrieve all students enrolled in a course
export async function getEnrollmentsForCourse(req: Request, res: Response) {
  const { courseCode } = req.params;
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 results per page
  logger.info("Attempting to retrieve enrollments for course:", courseCode);
  try {
    // Parse page and limit as integers
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);

    // Validate that page and limit are positive integers
    if (parsedPage <= 0 || parsedLimit <= 0) {
      logger.warn("Page and limit must be positive integers.");
      res
        .status(400)
        .json({ message: "Page and limit must be positive integers." });
      return;
    }

    // Calculate skip value for pagination
    const skip = (parsedPage - 1) * parsedLimit;

    // Fetch enrollments with pagination and populate student details
    const enrollments = await Enrollment.find({ courseCode })
      .populate("studentId", "name email") // Populate only name and email from Student
      .skip(skip) // Skip the records of previous pages
      .limit(parsedLimit) // Limit the number of records to `limit`
      .exec();

    // If no enrollments are found, respond with 404
    if (!enrollments || enrollments.length === 0) {
      logger.warn("No enrollments found for this course");
      res.status(404).json({ message: "No enrollments found for this course" });
      return;
    }

    // Calculate total documents for the course (for pagination info)
    const total = await Enrollment.countDocuments({ courseCode });

    logger.info("Retrieved enrollments for course:", courseCode);
    res.status(200).json({
      success: true,
      data: enrollments,
      pagination: {
        total,
        currentPage: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        perPage: parsedLimit,
      },
    });
  } catch (error) {
    logger.error("Error retrieving enrollments:", error);
    res.status(500).json({ message: "Error retrieving enrollments", error });
  }
}

export async function cancelEnrollment(req: Request, res: Response) {
  const { enrollmentId } = req.params;
  const user = (req as any).user;
  logger.info("Attempting to cancel enrollment with ID:", enrollmentId);
  try {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      logger.warn("Enrollment not found");
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }
    if (user.modelType === "Student" && user._id !== enrollment.studentId) {
      logger.warn("You are not authorized to enroll this student");
      res.status(403).json({
        message: "You are not authorized to enroll this student",
      });
      return;
    }

    const deletedEnrollment = await Enrollment.findByIdAndDelete(enrollmentId);

    if (!deletedEnrollment) {
      logger.warn("Enrollment not found");
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }
    logger.info("Enrollment canceled successfully");
    res.status(200).json({ message: "Enrollment canceled successfully" });
  } catch (error) {
    logger.error("Error canceling enrollment:", error);
    res.status(500).json({ message: "Error canceling enrollment", error });
  }
}
