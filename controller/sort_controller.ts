import { Request, Response } from "express";
import Student from "../models/Student";
import Course from "../models/Course";
import { mergeSort, quickSort } from "../helpers/sorting_argorithms";
import logger from "../utils/logger";

function isFieldValid(model: any, field: string):boolean {
  return (Object.keys(model.schema.obj).includes(field));
}

function isValidOrder(order: string | undefined): boolean {
  return order === "asc" || order === "desc";
}


export async function getSortedStudents(req: Request, res: Response) {
  const { field , order } = req.query; // Get sort field (e.g., 'grade') and order (e.g., 'asc')
  logger.info(
    "Attempting to sort students with field:",
    field,
    "and order:",
    order
  );

  // Validate if the provided field exists in the Student model
  if (!field || !isFieldValid(Student, field as string)) {
    logger.error(`Invalid field parameter: ${field}`);
    res
      .status(400)
      .json({
        message: `Invalid field parameter: ${field}. Please provide a valid field.`,
      });
       return;
  }

  // Validate if the provided order is 'asc' or 'desc'
  if (order && !isValidOrder(order as string)) {
    logger.error(`Invalid order parameter: ${order}`);
     res
      .status(400)
      .json({
        message: `Invalid order parameter: ${order}. Valid values are 'asc' or 'desc'.`,
      });
      return;
  }

  try {
    const students = await Student.find({});
    if (!students){
         logger.warn("No students found");
      res.status(404).json({ message: "No students found" });
    }

    let sortedStudents = mergeSort(students, field as string); // Use sorting algorithm

    // If the order is descending, reverse the sorted array
    if (order === "desc") {
      sortedStudents = sortedStudents.reverse();
    }

    const result = sortedStudents.map((student) => ({
      id: student._id,
      name: student.name,
      [field as string]: student[field as string], 
    }));
    logger.info("Sorted students successfully");
    res.json({
      field: field,
      order: order || "asc", // Default to 'asc' if not provided
      data: result,
    });
  } catch (error) {
    logger.error("Error sorting students:", error);
    res.status(500).json({ message: "Error sorting students", error });
  }
}

// Sort Courses
export async function getSortedCourses(req: Request, res: Response) {
  const { field, order } = req.query; // Get sort field, for example: 'title'
  logger.info(
    "Attempting to sort courses with field:",
    field,
    "and order:",
    order
  );

  // Validate if the provided field exists in the Course model
  if (!field || !isFieldValid(Course, field as string)) {
    logger.error(`Invalid field parameter: ${field}`);
     res
      .status(400)
      .json({
        message: `Invalid field parameter: ${field}. Please provide a valid field.`,
      });
      return;
  }

  // Validate if the provided order is 'asc' or 'desc'
  if (order && !isValidOrder(order as string)) {
    logger.error(`Invalid order parameter: ${order}`);
     res
      .status(400)
      .json({
        message: `Invalid order parameter: ${order}. Valid values are 'asc' or 'desc'.`,
      });
      return;
  }

  try {
    const courses = await Course.find({}); // Fetch all courses

    let sortedCourses = quickSort(courses, field as string); // Use sorting algorithm

    // If the order is descending, reverse the sorted array
    if (order === "desc") {
      sortedCourses = sortedCourses.reverse();
    }

    const result = sortedCourses.map((course) => ({
      id: course._id,
      courseCode: course.courseCode,
      [field as string]: course[field as string], // Dynamically include the sorted field in the response
    }));

    res.json({
      field: field,
      order: order || "asc", // Default to 'asc' if not provided
      data: result,
    });
  } catch (error) {
    logger.error("Error sorting courses:", error);
    res.status(500).json({ message: "Error sorting courses", error });
  }
}
