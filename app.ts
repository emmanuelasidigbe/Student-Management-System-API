import { Application } from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import connectDB, { createInstructor } from "./config/db";
import createServer from "./config/server";

dotenv.config();


const app: Application = createServer();
// Start server
(async () => {
  try {
    await connectDB(); // connecting to mongodb
   await createInstructor();
    app.listen(3000, () => {
      logger.info("Server started on port 3000");
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
    
  }
})();
