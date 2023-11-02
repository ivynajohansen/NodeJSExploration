import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import pool from './db.js';
import userRouter from "./routes/user-routes.js";
import blogRouter from "./routes/blog-routes.js";

const app = express();
const dblink = process.env.DB_CONNECTION_STRING;
const port = 8000;

app.use(express.json());
app.use((req, res, next) => {
  req.db = pool; // Attach the database connection pool to req.db
  next();
});

app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);

pool.connect()
  .then(() => {
    app.listen(port, () => {
      console.log('Connected to DB and listening to port ' + port);
    });
  })
  .catch((err) => console.error(err));