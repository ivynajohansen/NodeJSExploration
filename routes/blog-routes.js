import express from "express";
import { getBlogs, addBlog, updateBlog, getBlog, deleteBlog, getUserBlogs } from "../controllers/blog-contoller.js";
import { verifyToken, verifyOwnership } from "../controllers/auth.js";

const blogRouter = express.Router();

blogRouter.use(verifyToken);

blogRouter.get("/", getBlogs);
blogRouter.post("/add", addBlog);
blogRouter.get("/:id", getBlog);
blogRouter.get("/user/:id", getUserBlogs);

blogRouter.put("/update/:id", verifyOwnership, updateBlog);
blogRouter.delete("/delete/:id", verifyOwnership, deleteBlog);


export default blogRouter;