import { Request, Response } from "express";
import Student from "../models/Student";
import Enrollment from "../models/Enrollment";
import Course from "../models/Course";
import logger from "../utils/logger";
import { Gender } from "../types/model_types";

export async function getStudents(req: Request, res: Response) {
  try {
    const { name, grade, gender, minGrade, maxGrade, page, limit } = req.query;

    // Build the query object dynamically
    const query: any = {
      ...(name ? { name: { $regex: name as string, $options: "i" } } : {}),
      ...(gender ? { gender: gender as Gender } : {}),
      ...(grade ? { grade: Number(grade) } : {}),
    };

    // Add minGrade and maxGrade filters to `grade`
    if (minGrade || maxGrade) {
      query.grade = { ...(query.grade || {}) };
      if (minGrade) query.grade.$gte = Number(minGrade);
      if (maxGrade) query.grade.$lte = Number(maxGrade);
    }

    // Pagination defaults
    const pageNum = parseInt(page as string, 10) || 1; // Default to page 1
    const pageSize = parseInt(limit as string, 10) || 10; // Default to 10 items per page

    // Execute the query with pagination
    const students = await Student.find(query)
      .select("-enrollments")
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    // Get the total count of documents matching the query (for pagination meta-data)
    const total = await Student.countDocuments(query);
    

    if (students.length===0) {
      logger.error("No students found");
      res.status(404).json({ message: "No students found" });
     return 
    }

    logger.info("Students retrieved successfully"),
    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      }, 
    });
  } catch (error) {
    logger.error("Error retrieving students:", error);
    res.status(500).json({ message: "Error retrieving students" });
  }
}

export async function getStudentById(req: Request, res: Response) {
  const _id: string = req.params.id;
  const user = (req as any).user;
  try {
    logger.info("Attempting to retrieve student with ID:", _id);
      const student = await Student.findById(_id);
    if (!student) {
      logger.warn(`Student with ID ${_id} not found`);
      res.status(404).json({ message: "Student not found" });
      return 
      
    }
     if (
       user.modelType === "Student" &&
       user.id !== (student._id as any).toString()
     ) {
       logger.warn("You are not authorized to see this data");
       res.status(403).json({
         message: "You are not authorized to see this data",
       });
       return;
     }
      
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    logger.error("Error retrieving student:", error);
    res.status(500).json("error retrieving student")
  }
}
export async function createStudent(req: Request, res: Response) {
  try {
    // Extract student data from request body
    const { name, gender,password, residence, grade, email, phone, dateOfBirth } =
      req.body;
    logger.info("Attempting to create a new student with data:", req.body);

   
    // Save the new student document in the database
    const newStudent = await Student.create({
      name,
      gender,
      residence,
      password,
      grade,
      email,
      phone,
      dateOfBirth,
    });

    // Respond with the created student
    logger.info("Student created successfully");
     res.status(201).json({
      success: true,
      data: newStudent,
    });
  } catch (error) {
   
   logger.error("Error creating student:", error);
    // Respond with an error message
   res.status(500).json({ message: "Server error" });
  }
}
export async function updateStudent(req: Request, res: Response) {
  const { id } = req.params; // Getting the student ID from the URL params
  const updateData = req.body; // The updated student data
  logger.info("Attempting to update student with ID:", id);
  try {
     const student = await Student.findById(id);
     if(!student){
      logger.warn(`Student with ID ${id} not found. Update operation failed.`);
       res.status(404).json({ message: "Student not found" });
      return
     }
    if ((req as any).user.modelType === "Student" && (req as any).user.id !== (student._id as any).toString()) {

      logger.warn("You are not authorized to update this student");
      res.status(403).json({
        message: "You are not authorized to update this student",
      });
      return
    }
    // Find the student by ID and update it
    const updatedStudent = await Student.findByIdAndUpdate(
      id, // The ID of the student to update
      updateData, 
      { new: true, runValidators: true } // 'new: true' ensures the updated object is returned; 'runValidators' ensures validation is applied
    );
    // Send the updated student data as a response
    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    logger.error("Error updating student:", error);
    res.status(500).json({ message: "Server error while updating student" });
  }
}
export async function deleteStudent(req: Request, res: Response) {
  // Extract the student ID from request parameters
  const { id } = req.params;

  try {
    // Log the attempt to delete the student
    logger.info("Attempting to delete student with ID:", id);

    // Attempt to find and delete the student by ID
    const deletedStudent = await Student.findByIdAndDelete(id);

    // If the student was not found, log a warning and return a 404 response
    if (!deletedStudent) {
      logger.warn(`Student with ID ${id} not found. Delete operation failed.`);
      res.status(404).json({ message: "Student not found" });
      return;
    }

    // If deletion is successful, return the deleted student data
    logger.info(`Student with ID ${id}, Delete operation success.`);
    res.json({ success: true, data: deletedStudent });
  } catch (error) {
    // Log an error message and return a 500 response for server errors
    logger.error(`Error deleting student with ID ${id}: ${error}`, { error });
    res.status(500).json({ message: "Server error" });
  }
}
