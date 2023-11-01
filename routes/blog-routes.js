import express from "express";
import { getBlogs, addBlog, updateBlog, getBlog, deleteBlog, getUserBlogs } from "../controllers/blog-contoller.js";
import { verifyToken } from "../controllers/auth.js";

const blogRouter = express.Router();

blogRouter.use(verifyToken);

blogRouter.get("/", getBlogs);
blogRouter.post("/add", addBlog);
blogRouter.put("/update/:id", updateBlog);
blogRouter.get("/:id", getBlog);
blogRouter.delete("/delete/:id", deleteBlog);
blogRouter.get("/user/:id", getUserBlogs);

export default blogRouter;