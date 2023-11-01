import express from "express";
import { getUsers, addUser, login } from "../controllers/user-controller.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/register", addUser);
userRouter.post("/login", login);

export default userRouter;