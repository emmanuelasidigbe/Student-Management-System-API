import express, { Application } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import studentRoute from "../routes/student_route";
import courseRoute from "../routes/course_route";
import enrollmentRoute from "../routes/enrollment_route";
import sortRoute from "../routes/sort_route";
import authRoute from "../routes/index";
import swaggerDocument from "../swagger-output.json"; // Use the path relative to the current file
import logger from "../utils/logger";
import { authLimiter, limiter } from "../middleware/limiter/limiter";

export default function createServer() {
  dotenv.config();
  const app: Application = express();

  // Middleware
  app.use(express.json());

  const morganFormat = ":method :url :status :response-time ms";

  app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );

  // Use the Swagger UI middleware to serve the API documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // API routes
  app.use("/api/auth", authLimiter, authRoute);
  app.use(limiter);
  app.use("/api/students", studentRoute);
  app.use("/api/courses", courseRoute);
  app.use("/api/enrollments", enrollmentRoute);
  app.use("/api/sort", sortRoute);
  
  return app;
}
