import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { initializeDatabases } from './config/redisClient.js';
// Routers
import userAuthRoutes from './routes/userAuth.js';
import problemRoutes from './routes/problem.js';
import submissionRoutes from './routes/submissions.js';

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

// mongoDB connection
await connectDB();
// redis connection
await initializeDatabases();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Routers
app.use("/api/users", userAuthRoutes);
app.use("/api/problems", problemRoutes);

export default app;