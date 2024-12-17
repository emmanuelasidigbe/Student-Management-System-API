import { createClient } from "redis";
import logger from "./logger";


const redisClient = createClient()

redisClient.on("error", (err) => logger.error("Redis Error:", err));

(async () => {
  await redisClient.connect();
  logger.info("Redis connected");
})();

export default redisClient