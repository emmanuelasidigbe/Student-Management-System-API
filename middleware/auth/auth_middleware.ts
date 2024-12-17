import logger from "../../utils/logger";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware to verify the JWT token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
       res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
        return;
    }

    // Extract token from the Bearer string
    const token = authHeader.split(" ")[1];

    // Verify the token using JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET! as string, (err, decoded) => {
      if (err) {
         res
          .status(403)
          .json({ success: false, message: "Invalid or expired token" });
          return;
      }

      // Attach the decoded user to the request object
      (req as any).user = decoded;

      // Call the next middleware or route handler
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Middleware to verify the JWT token and check if the user is an instructor

export const verifyTokenAndInstructor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
      return;
    }

    // Extract token from the Bearer string
    const token = authHeader.split(" ")[1];

    // Verify the token using JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET! as string, (err, decoded) => {
      if (err) {
        res
          .status(403)
          .json({ success: false, message: "Invalid or expired token" });
        return;
      }
       if((decoded as any).modelType !== "Instructor"){
        res
        .status(403).json({ success: false, message: "Unauthorized: User is not an instructor" });
        return 
       }
      // Attach the decoded user to the request object
      (req as any).user = decoded;

      // Call the next middleware or route handler
      
      next();
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};