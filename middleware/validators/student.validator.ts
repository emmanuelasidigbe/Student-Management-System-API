import { body,validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { Gender } from "../../types/model_types"; 
import logger from "../../utils/logger";

export const studentValidator = [
  // Validate name: it must not be empty
  body("name").notEmpty().withMessage("Name is required"),

  // Validate gender: it must be one of the predefined values from the Gender enum
  body("gender")
    .isIn(Object.values(Gender)) // Validates against Gender enum values
    .withMessage(`Gender must be one of: ${Object.values(Gender).join(", ")}`),

  // Validate residence: it must not be empty
  body("residence").notEmpty().withMessage("Residence is required"),

  // Validate grade: it must be a positive integer
  body("grade")
    .isInt({ gt: 0 })
    .withMessage("Grade must be a positive integer"),

  // Validate email: it must be a valid email address
  body("email").isEmail().withMessage("Enter a valid email address"),

  // Validate phone: it must not be empty (could add more specific validation later like regex)
  body("phone").notEmpty().withMessage("Phone is required"),

  // Validate password: it must not be empty
  body("password").notEmpty().withMessage("Password is required"),

  // Validate dateOfBirth: it must be a valid date
  body("dateOfBirth").isDate().withMessage("Enter a valid date of birth"),

  // Error handler that runs after validation checks
  (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Validating student data...");
    const errors = validationResult(req); // Collect validation errors
    if (!errors.isEmpty()) {
      // If there are errors, send a response with error messages
      logger.warn("Student data is invalid");
      res.status(400).json({
        errorMessage: errors
          .array()
          .map((error) => error.msg) // Map error messages
          .join("\n"), // Combine all error messages in one string
      });
      return;
    }
    // If there are no errors, proceed to the next middleware
    logger.info("Student data is valid");
    next();
  },
];
