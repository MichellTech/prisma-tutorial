import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../utils/redisClient";

export const redisCache = (key: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisClient = getRedisClient();
      const data = await redisClient.get(key);

      if (data) {
        console.log("📦 Cache hit");
        return res.status(200).json(JSON.parse(data));
      }

      console.log("💾 Cache miss");
      next();
    } catch (err) {
      console.error("Redis cache middleware error:", err);
      next();
    }
  };
};
