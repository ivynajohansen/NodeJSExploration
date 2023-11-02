import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export const verifyToken = (req, res, next) => {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies['jwt-token'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized. Token is invalid.' });
        }
        req.user = decoded;
        
        next();
    });
};

export const verifyOwnership = async (req, res, next) => {
    const blogId = req.params.id;
    const pool = req.db;

    try {
        const getUserIdQuery = await pool.query(
            'SELECT "user" FROM "Blog" WHERE id = $1',
            [blogId]
        );

        if (getUserIdQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const blogOwnerId = getUserIdQuery.rows[0].user;
        const tokenUserId = req.user.userId; // Extract user ID from the JWT token

        if (tokenUserId !== blogOwnerId) {
            return res.status(403).json({ message: 'You are not authorized to perform this action on the blog.' });
        }

        next();
    } catch (error) {
        // Handle any errors that occur during the asynchronous operations
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
