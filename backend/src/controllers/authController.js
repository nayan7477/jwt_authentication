import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { allQuery } from '../repositories/query.js';
import { storeRefreshToken, hashRefreshToken } from '../services/refreshTokenService.js';
import { redisClient } from '../configs/redis.js';

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
        await storeRefreshToken(refreshToken, user.id);

        const accessToken = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

        // 4. Set HttpOnly Cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh',
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });
        return res.status(200).json({
        message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Generate Refresh Token
export async function refreshAccessToken(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token missing.'
            });
        }
        // 1. Verify JWT
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        // 2. Hash refresh token
        const tokenHash = hashRefreshToken(refreshToken);
        // 3. Check Redis
        const userId = await redisClient.get(`refresh:${tokenHash}`);
        if (!userId) {
            return res.status(401).json({
                message: 'Refresh token is no longer valid.'
            });
        }
        // Optional but sensible consistency check
        if (String(decoded.id) !== String(userId)) {
            return res.status(401).json({
                message: 'Invalid refresh token.'
            });
        }
        // 4. Create new access token
        const accessToken = jwt.sign({id: decoded.id,email: decoded.email,name: decoded.name},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '15m'});

        // 5. Replace access-token cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        return res.status(200).json({
            message: 'Access token refreshed.'
        });

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired refresh token.'
        });
    }
}
