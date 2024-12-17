import { Request, Response } from "express";
import Course from "../models/Course";
import logger from "../utils/logger";
export async function getCourses(req: Request, res: Response) {
  try {
    const { department, semester } = req.query; // Get filters from query params

    // Build the filter object
    let filter: any = {};
    let query: any = {};
    if (department) {
      filter.department = department;

      query.department = { $regex: new RegExp(department as string, "i") }; // Case-insensitive regex
    }
    if (semester) {
      filter.semester = semester;
      query.semester = { $regex: new RegExp(semester as string, "i") }; // Case-insensitive regex
    }
    logger.info("Attempting to retrieve courses with filter:", filter);

    // Find courses with the given filter
    const courses = await Course.find(query);
    if (!courses.length) {
      // Check if courses array is empty
      logger.warn("No courses found");
      res.status(404).json({
        message: "No courses found",
        appliedFilter: filter,
      });
      return;
    }

    // Return the courses along with the filter
    logger.info("Courses retrieved successfully");
    res.status(200).json({
      message: "Courses retrieved successfully",
      appliedFilter: filter,
      data: courses,
    });
  } catch (error) {
    logger.error("Error retrieving courses:", error);
    res.status(500).json({
      message: "Internal Server error",
    });
  }
}

// Get specific course details by courseCode
export async function getCourseByCode(req: Request, res: Response) {
  const { courseCode } = req.params;
  logger.info("Attempting to retrieve course by courseCode: ", courseCode);
  try {
    const course = await Course.findOne({ courseCode }); // Find course by courseCode

    if (!course) {
      logger.warn("Course not found");
      res.status(404).json({ message: "Course not found" });
      return;
    }
    logger.info("Course retrieved successfully:", course);
    res.status(200).json(course); // Return the course details
  } catch (error) {
    logger.error("Error retrieving course by courseCode:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Create new course offering
export async function createCourse(req: Request, res: Response) {
  const { courseCode, title, description, department, semester } = req.body;
  logger.info("Attempting to create course with data: ", req.body);
  try {
    // Check if course already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      logger.warn("Course with this courseCode already exists");
      res
        .status(400)
        .json({ message: "Course with this courseCode already exists" });
      return;
    }

    const newCourse = await Course.create({
      courseCode,
      title,
      description,
      department,
      semester,
    });
    if (!newCourse) {
      logger.warn("Failed to create course");
      res.status(500).json({ message: "Failed to create course" });
      return;
    }

    logger.info("Course created successfully:", newCourse);

    res.status(201).json(newCourse); // Return the newly created course
  } catch (error) {
    logger.error("Error creating course:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Update course information by courseCode
export async function updateCourse(req: Request, res: Response) {
  const { courseCode } = req.params;
  const updatedData = req.body;
  logger.info(
    `Attempting to update course with courseCode: ${courseCode} with data: `,
    updatedData
  );
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { courseCode },
      updatedData,
      { new: true }
    );

    if (!updatedCourse) {
      logger.warn("Unable to update courser or not found");
      res
        .status(404)
        .json({ message: "Unable to update courser or not found" });
      return;
    }

    res.status(200).json(updatedCourse); // Return the updated course details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Delete course from catalog by courseCode
export async function deleteCourse(req: Request, res: Response) {
  const { courseCode } = req.params;

  try {
    logger.info("Attempting to delete course with courseCode: ", courseCode);
    const deletedCourse = await Course.findOneAndDelete({ courseCode });

    if (!deletedCourse) {
      logger.warn("Course not found");
      res.status(404).json({ message: "Course not found" });
      return;
    }

    logger.info("Course removed successfully");
    res.status(200).json({ message: "Course removed successfully" }); // Confirm successful deletion
  } catch (error) {
    logger.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error" });
  }
}
