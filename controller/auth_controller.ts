import { Request, Response } from "express";
import  { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import BaseUser from "../models/BaseUser";
import transporter from "../utils/email_transport";
import { isEmail, isEmpty } from "validator";

export async function Login(req: Request, res: Response) {
  const { email, password } = req.body;
    if (!isEmail(email) || isEmpty(password)) {
      logger.warn("Email or Password is required");
      res.status(400).json({ success: false, message: "Email or Password is required" });
      return;
    }
  try {
    logger.info("Attempting to login with email:", email);
    // Query the base model to find the user
    const user = await BaseUser.findOne({ email });

    if (!user) {
        logger.warn("Invalid email or password");
       res.status(404).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Compare passwords
    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
        logger.warn("Invalid email or password");
       res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate a token
    const token = jwt.sign(
      { id: user._id, modelType: user.modelType },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
   logger.info("Login successful");
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        modelType: user.modelType, // Identify if the user is a Student or Instructor
      },
    });
  } catch (error) {
    logger.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
}


export async function ResetPassword(req: Request, res: Response) {
  const { token } = req.query; // JWT passed in query parameters
  const { newPassword } = req.body;

  logger.info("validating token and password for password reset", token);
  if (isEmpty(newPassword) || isEmpty(token as string) ) {
    logger.warn("Token and new password are required");
    res.status(400).json({
      success: false,
      message: "Token and new password are required",
    });
    return;
  }

  try {
    // Verify and decode the token
       logger.info("Attempting to reset password with token:", token);
    const decoded: any = jwt.verify(token as string, process.env.JWT_SECRET!);

    if (!decoded || !decoded.resetPassword) {
        logger.warn("Invalid or expired token");
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }

    // Find user by email from BaseUser model (either student or instructor)
    const user = await BaseUser.findOne({ email: decoded.email });
    if (!user) {
        logger.warn("User not found");
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Hash and update the user's password
    const hashedPassword = await hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    logger.info("Password reset successfully");

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error("Error resetting password:", error);
    if ((error as any).name === "TokenExpiredError") {
        logger.error("Token has expired");
      res.status(401).json({ success: false, message: "Token has expired" });
    } else {
        logger.error("Server error");
      res.status(500).json({ success: false, message: "Server error", error });
    }
  }
}


export async function RequestPasswordReset(req: Request, res: Response) {
  const { email } = req.body;
   logger.info("Attempting to request password reset for email:", email);
  if (!isEmail(email)) {
    logger.warn("Email is required");
    res
      .status(400)
      .json({ success: false, message: "Email is required" });
      return 
  }

  try {
    // Check if email exists in either Instructor or Student (BaseUser model will manage this)
    const user = await BaseUser.findOne({ email });

    if (!user) {
        logger.warn("Email not found");
      res.status(404).json({ success: false, message: "Email not found" });
      return;
    }

    // Create JWT token for password reset
    const token = jwt.sign(
      { email, resetPassword: true },
      process.env.JWT_SECRET! as string,
      { expiresIn: "1h" }
    );

    //using a logger here for simplicity sake
    logger.info(
      `Password reset token: ${token}`
    );

   /// uncomment the code below to sent the token via email and also make sure the email is set in the .env file
//    await transporter.sendMail({ 
//       from: "ark1500j@example.com",
//       to: email,
//       subject: "Password Reset Request",
//       text: `Your password token: ${token}`,
//     })

    //sending the token back for simplicity sake
    res.status(200).json({
      success: true,
      message: "Password reset token sent",
      token: token, // Include the token in the response
    });

  } catch (error) {
    logger.error("Error requesting password reset:", error);
     res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
}
