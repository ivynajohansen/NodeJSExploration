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
