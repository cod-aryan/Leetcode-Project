import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

const app = express();

dotenv.config();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Server is running!");
});

export default app;