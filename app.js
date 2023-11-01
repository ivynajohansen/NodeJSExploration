import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/user-routes.js";
import blogRouter from "./routes/blog-routes.js";

const app = express();
const dblink = process.env.DB_CONNECTION_STRING;

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);
mongoose.connect(dblink, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(8000, () => {
      console.log("Connected to DB and listening to port 8000");
    });
  })
  .catch((err) => console.log(err));