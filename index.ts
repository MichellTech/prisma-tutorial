import express from "express";
import { Request, Response } from "express";
import {PrismaClient} from "@prisma/client"

const app = express();
const prisma = new PrismaClient();
app.use(express.json());


// create user
interface CreateUserBody {
  email: string;
  name?: string;
  title : string;
description: string;
posterId : number
}

// create user
const createUser = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  try {
    const { email, name } = req.body; // ✅ now TypeScript knows email exists

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const newUser = await prisma.user.create({
      data: { email,  name: name ?? null,},
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

app.post("/users", createUser)

// get users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await prisma.user.findMany();
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

app.get("/users", getAllUsers);

// jobs
const createJob = async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
  try {
    const { title, description, posterId } = req.body; // ✅ now TypeScript knows email exists

    if (!title || !description  || !posterId ) {
      return res.status(400).json({ error: "Please provide all values" });
    }

    const newJob = await prisma.jobs.create({
      data: { title,  description, posterId},
    });

    return res.status(201).json(newJob);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create job" });
  }
};

app.post("/jobs", createJob)

// get users
const getAllJobs = async (req: Request, res: Response) => {
  try {
    const alljobs = await prisma.jobs.findMany({
        include:{
            poster: true
        }
    });
    return res.status(200).json(alljobs);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

app.get("/jobs", getAllJobs);

// get single job
const getuserSingleJobs = async (req: Request, res: Response) => {
  try {
    const {id} =  req.params
     const jobId = Number(id);
      if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job ID" });
    }
    const job = await prisma.jobs.findMany({
      where: { posterId: jobId },
    });
      if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

app.get("/jobs/:id", getuserSingleJobs);

// home
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello World!");
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});