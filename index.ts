import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { connectRedis } from "./utils/redisClient";
import { redisCache } from "./middleware/redisMiddleware";

// Initialize Express and Prisma
const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: "*" }));
app.use(express.json());


// ------------------- TYPES -------------------
interface CreateUserBody {
  email: string;
  name?: string;
}

interface CreateJobBody {
  title: string;
  description: string;
  posterId: number;
}



// ------------------- USER ROUTES -------------------
const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const newUser = await prisma.user.create({
      data: { email, name: name ?? null },
    });

    return res.status(201).json(newUser);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await prisma.user.findMany();
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

app.post("/users", createUser);
app.get("/users", getAllUsers);

// ------------------- JOB ROUTES -------------------
const createJob = async (req: Request<{}, {}, CreateJobBody>, res: Response) => {
  try {
    const { title, description, posterId } = req.body;

    if (!title || !description || !posterId) {
      return res.status(400).json({ error: "Please provide all values" });
    }

    const newJob = await prisma.jobs.create({
      data: { title, description, posterId },
    });

    return res.status(201).json(newJob);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create job" });
  }
};

const getAllJobs = async (req: Request, res: Response) => {
  try {
    const redisClient = await connectRedis();
    const allJobs = await prisma.jobs.findMany({
      include: { poster: true },
    });

    await redisClient.setEx("alljobs", 3600, JSON.stringify(allJobs));
    return res.status(200).json(allJobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

app.post("/jobs", createJob);
app.get("/jobs", redisCache("alljobs"), getAllJobs);

// ------------------- START SERVER -------------------
(async () => {
  try {
    await connectRedis();
    app.listen(4000, () => {
      console.log("🚀 Server running on port 4000");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
})();
