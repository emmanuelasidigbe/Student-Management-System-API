import { body, validationResult } from "express-validator";
import {NextFunction, Request,Response} from "express";
import {Semester} from "../../types/model_types";
import logger from "../../utils/logger";
import { executeValidator } from "./execute.validator";

export const courseValidator = [
  body("courseCode")
    .notEmpty()
    .withMessage("Course code is required")
    .isString()
    .withMessage("Course code must be a string")
    .matches(/^[A-Za-z]+[0-9]+$/)
    .withMessage("Course code must follow the format, e.g., 'CS101'"),

  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 500 })
    .withMessage("Description should not exceed 500 characters"),

  body("department")
    .notEmpty()
    .withMessage("Department is required")
    .isString()
    .withMessage("Department must be a string"),

  body("semester")
    .notEmpty()
    .withMessage("Semester is required")
    .isString()
    .withMessage("Semester must be a string")
    .isIn(Object.values(Semester))
    .withMessage(
      `Semester must be one of: ${Object.values(Semester).join(", ")}`
    ),

  // Error handler that runs after validation checks
 executeValidator,
];
