import { createClient } from "redis";

let redisClient: any;

export const connectRedis = async () => {
  if (redisClient) return redisClient; // reuse existing connection

  redisClient = createClient();

  redisClient.on("error", (err: any) => console.error("Redis Client Error:", err));

  await redisClient.connect();
  console.log("🧠 Connected to Redis");

  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) throw new Error("Redis client not initialized. Call connectRedis() first.");
  return redisClient;
};
