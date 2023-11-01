import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export const getUsers = async (req, res, next) =>{
    let users;
    try {
        users = await User.find();
    }
    catch (err) {
        return console.log(err);
    }

    if (!users){
        return res.status(404).json({message: "No users found"});
    }

    return res.status(200).json({users});
}


export const addUser = async (req, res, next) =>{
    const {name, email, password} = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email});
    }
    catch (err){
        return console.log(err);
    }
    
    if (existingUser){
        return res.status(400).json({message: "Email already in use"});
    }

    const user = new User ({
        name,
        email,
        password : bcrypt.hashSync(password),
        blogs: [],
    })

    try{
        await user.save();
    }
    catch (err){
        console.log(err);
    }

    return res.status(201).json({user});
}

export const login = async (req, res, next) => {
    const {email, password} = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({email});
    }
    catch (err) {
        return console.log(err);
    }

    if (!existingUser){
        return res.status(404).json({message: "Email does not exist"});
    }

    const auth = bcrypt.compareSync(password, existingUser.password);

    if (!auth){
        return res.status(400).json({message: "Incorrect Password"});
    }

    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', serialize('jwt-token', token, { httpOnly: true, maxAge: 3600000 }));

    return res.status(200).json({message: "Login Successful"});
}