import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export const getUsers = async (req, res, next) =>{
    const pool = req.db; // Access the database connection pool from the request object

    try {
        const result = await pool.query('SELECT * FROM "User"');
        const users = result.rows;
        res.status(200).json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const addUser = async (req, res, next) =>{
    const {name, email, password} = req.body;
    const pool = req.db;

    try {
        const emailCheck = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = uuidv4();
    
        const newUser = await pool.query('INSERT INTO "User" (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [id, name, email, hashedPassword]);
        res.status(201).json({ user: newUser.rows[0] });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
}

export const login = async (req, res, next) => {
    const {email, password} = req.body;
    const pool = req.db;
    try {
        const existingUser = await pool.query('SELECT id, password FROM "User" WHERE email = $1', [email]);
        const user = existingUser.rows[0];
    
        if (!user) {
          return res.status(404).json({ message: 'Email does not exist' });
        }
    
        const hashedPassword = user.password;
        const auth = bcrypt.compareSync(password, hashedPassword);
    
        if (!auth) {
          return res.status(400).json({ message: 'Incorrect Password' });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.setHeader('Set-Cookie', serialize('jwt-token', token, { httpOnly: true, maxAge: 3600000 }));
    
        return res.status(200).json({ message: 'Login Successful' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
}