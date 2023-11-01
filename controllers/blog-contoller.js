import mongoose from "mongoose";
import Blog from "../model/Blog.js";
import User from "../model/User.js";

export const getBlogs = async (req, res, next) =>{
    let blogs, totalBlogs;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    try {
        totalBlogs = await Blog.countDocuments();
        const skip = (page - 1) * limit;
        blogs = await Blog.find()
        .skip(skip)
        .limit(limit);
    }
    catch (err) {
        return console.log(err);
    }

    if (!blogs){
        return res.status(404).json({message: "No blogs found"});
    }

    return res.status(200).json({ blogs, totalBlogs });
}

export const getBlog = async (req, res, next) =>{
    const blogId = req.params.id;
    let blog;
    try {
        blog = await Blog.findById(blogId);
    }
    catch (err) {
        return console.log(err);
    }

    if (!blog){
        return res.status(404).json({message: "No blog found"});
    }

    return res.status(200).json({blog});
}


export const addBlog = async (req, res, next) => {
    const {title, description, image, user} = req.body;

    let existingUser;
    try{
        existingUser = await User.findById(user);
    }
    catch (err) {
        return console.log(err);
    }   

    if (!existingUser){
        return res.status(400).json({message: "Unable to find user by this ID"});
    }

    const blog = new Blog ({
        title,
        description,
        image, 
        user,
    });

    try{
        const session = await mongoose.startSession();
        session.startTransaction(); //session is so all operations succeed or none
        await blog.save();
        existingUser.blogs.push(blog);
        await existingUser.save({session});
        await session.commitTransaction();
    }
    catch (err){
        return console.log(err);
    }

    return res.status(201).json({blog});
}

export const updateBlog = async (req, res, next) =>{
    const {title, description, image} = req.body;
    const blogId = req.params.id;
    let blog;
    try{
        blog = await Blog.findByIdAndUpdate (blogId, {
            title,
            description,
            image
        }, { new: true });
    }
    catch (err) {
        return console.log(err);
    }

    if (!blog){
        return res.status(500).json({message: "Unable to update"});
    }
    return res.status(200).json({blog});
}   

export const deleteBlog = async (req, res, next) =>{
    const blogId = req.params.id;
    let blog;
    try{
        blog = await Blog.findByIdAndRemove(blogId).populate('user');
        await blog.user.blogs.pull(blog);
        await blog.user.save();
    }
    catch (err) {
        return console.log(err);
    }

    if (!blog){
        return res.status(500).json({message: "Unable to delete"});
    }
    return res.status(200).json({message: "Delete Successfully"});
}   

export const getUserBlogs = async (req, res, next) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;

    let userBlogs;
    try {
        userBlogs = await User.findById(userId);
    } catch (err) {
        return console.log(err);
    }

    if (!userBlogs) {
        return res.status(404).json({ message: "No blogs found" });
    }

    const totalBlogs = userBlogs.blogs.length;

    userBlogs = await User.findById(userId)
        .populate({
            path: "blogs",
            options: {
                limit: limit,
                skip: (page - 1) * limit,
            }
        });

    return res.status(200).json({ userBlogs, totalBlogs });
}
