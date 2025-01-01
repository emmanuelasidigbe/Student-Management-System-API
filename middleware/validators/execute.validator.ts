  import {  validationResult } from "express-validator";
import {NextFunction, Request,Response} from "express";
import {Semester} from "../../types/model_types";
import logger from "../../utils/logger";
  export const executeValidator = (req: Request, res: Response, next: NextFunction) => {
    logger.info("Validating student data...");
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
}