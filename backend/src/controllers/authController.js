import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { allQuery } from '../repositories/query.js';
export async function login(req, res, next) {
    try {
        const { email, password } = req.body; // Plain text password from frontend

        const user = await allQuery.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // 2. Compare plain text password with stored hashedPassword
        const isPasswordValid = await bcrypt.compare(password, user.hashedpassword); // or user.hashed_password
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Generate JWT with non-sensitive identifiers
        const refreshToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        // 4. Set HttpOnly Cookie
        res.cookie('token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', //or strict
            maxAge: 604800000, // 1 hour
            path: '/refresh',
        });

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', //or strict
            maxAge: 60000, // 1 hour
        });

        return res.status(200).json({
            message: 'Logged in successfully',
            user: { name: user.name, email: user.email, age: user.age },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Generate Refresh Token
export function refreshAccessToken(req, res) {
    const refreshToken = req.cookies?.token;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token missing.' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token.' });
        }

        // Issue a new access token
        const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({ message: 'Token refreshed successfully.' });
    });
}
