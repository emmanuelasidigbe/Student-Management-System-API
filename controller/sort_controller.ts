import { Request, Response } from "express";
import Student from "../models/Student";
import Course from "../models/Course";
import { mergeSort, quickSort } from "../helpers/sorting_argorithms";
import { isFieldValid, isValidOrder } from "../helpers/helper";
import logger from "../utils/logger";
import redisClient from "../utils/redis_client";




export async function getSortedStudents(req: Request, res: Response) {
  const { field, order } = req.query; // Get sort field and order
  logger.info(
    `Attempting to sort students with field: ${field} and order: ${order}`
  );

  // Validate field
  if (!field || !isFieldValid(Student, field as string)) {
    logger.error(`Invalid field parameter: ${field}`);
    res.status(400).json({
      message: `Invalid field parameter: ${field}. Please provide a valid field.`,
    });
    return;
  }

  if (order && !isValidOrder(order as string)) {
    logger.error(`Invalid order parameter: ${order}`);
    res.status(400).json({
      message: `Invalid order parameter: ${order}. Valid values are 'asc' or 'desc'.`,
    });
    return;
  }

  const cacheKey = `students:sorted:${field}:${order || "asc"}`; // Create a unique Redis key

  try {
    // 1. Check if data exists in Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      logger.info("Returning sorted students from cache");
      res.json(JSON.parse(cachedData)); 
      return // Return cached data
    }

    // 2. Fetch students from DB
    const students = await Student.find({});
    if (!students) {
      logger.warn("No students found");
      res.status(404).json({ message: "No students found" });
      return 
    }

    let sortedStudents = mergeSort(students, field as string);

    if (order === "desc") {
      sortedStudents = sortedStudents.reverse();
    }

    const result = sortedStudents.map((student) => ({
      id: student._id,
      name: student.name,
      [field as string]: student[field as string],
    }));

    const responsePayload = {
      field: field,
      order: order || "asc",
      data: result,
    };

    // 3. Cache the sorted result in Redis with an expiry (60 seconds)
    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      EX: 60,
    });

    logger.info("Sorted students successfully and cached the result");
    res.json(responsePayload);
  } catch (error) {
    logger.error("Error sorting students:", error);
    res.status(500).json({ message: "Error sorting students", error });
  }
}


export async function getSortedCourses(req: Request, res: Response) {
  const { field, order } = req.query;
  logger.info(
    `Attempting to sort courses with field: ${field} and order: ${order}`
  );

  // Validate field
  if (!field || !isFieldValid(Course, field as string)) {
    logger.error(`Invalid field parameter: ${field}`);
    res.status(400).json({
      message: `Invalid field parameter: ${field}. Please provide a valid field.`,
    });
    return;
  }

  if (order && !isValidOrder(order as string)) {
    logger.error(`Invalid order parameter: ${order}`);
    res.status(400).json({
      message: `Invalid order parameter: ${order}. Valid values are 'asc' or 'desc'.`,
    });
    return;
  }

  const cacheKey = `courses:sorted:${field}:${order || "asc"}`;

  try {
    //  Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      logger.info("Cache hit");
      res.json(JSON.parse(cachedData));
      return 
    }

    const courses = await Course.find({});
    if (!courses) {
      logger.warn("No courses found");
      res.status(404).json({ message: "No courses found" });
      return 
    }

    let sortedCourses = quickSort(courses, field as string);
    if (order === "desc") {
      sortedCourses = sortedCourses.reverse();
    }

    const result = sortedCourses.map((course) => ({
      id: course._id,
      courseCode: course.courseCode,
      [field as string]: course[field as string],
    }));

    const responsePayload = {
      field: field,
      order: order || "asc",
      data: result,
    };

    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      EX: 60,
    });

    logger.info("cache miss");
    res.json(responsePayload);
  } catch (error) {
    logger.error("Error sorting courses:", error);
    res.status(500).json({ message: "Error sorting courses", error });
  }
}
