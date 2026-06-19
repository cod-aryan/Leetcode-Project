import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
// Routers
import userAuthRoutes from './routes/userAuth.js';

const app = express();

dotenv.config();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// mongoDB connection
await connectDB();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Routers
app.use("/api/users", userAuthRoutes);

export default app;