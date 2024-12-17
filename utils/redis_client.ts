import { createClient } from "redis";
import logger from "./logger";

const redisClient = createClient({
  socket: {
    host: "redis", // Service name defined in docker-compose.yml
    port: 6379, // Default Redis port
  },
});

redisClient.on("error", (err) => logger.error("Redis Error:", err));

(async () => {
  try {
    await redisClient.connect();
    logger.info("Redis connected successfully");
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
  }
})();

export default redisClient;
