import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { allQuery } from '../repositories/query.js';
import { createRefreshSession, rotateRefreshToken, generateFamilyId, revokeFamily } from '../services/refreshTokenService.js';

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await allQuery.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedpassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password',
            });
        }

        // One family represents one login/session.
        const familyId = generateFamilyId();

        // Unique identifier for this particular refresh token.
        const refreshTokenId = crypto.randomUUID();

        const refreshToken = jwt.sign(
            {
                sub: String(user.id),
                jti: refreshTokenId,
                familyId,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '7d',
            },
        );

        await createRefreshSession({
            refreshToken,
            userId: user.id,
            familyId,
        });

        const accessToken = jwt.sign(
            {
                sub: String(user.id),
                email: user.email,
                name: user.name,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '15m',
            },
        );

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
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

// Generate Refresh Token
export async function refreshAccessToken(req, res) {
    try {
        const oldRefreshToken = req.cookies?.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                message: 'Refresh token missing.',
            });
        }

        // 1. Verify JWT signature + expiration.
        const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const userId = decoded.sub;
        const familyId = decoded.familyId;

        if (!userId || !familyId || !decoded.jti) {
            return res.status(401).json({
                message: 'Invalid refresh token.',
            });
        }

        // 2. Create the replacement refresh token.
        const newRefreshTokenId = crypto.randomUUID();

        const newRefreshToken = jwt.sign(
            {
                sub: String(userId),
                jti: newRefreshTokenId,
                familyId,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '7d',
            },
        );

        // 3. Atomically rotate old → new.
        const result = await rotateRefreshToken({
            oldRefreshToken,
            newRefreshToken,
            userId,
            familyId,
        });

        // 4. Handle rotation result.
        if (result === 'REUSED') {
            // Someone presented a refresh token that
            // had already been rotated.

            await revokeFamily(familyId);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/auth/refresh',
            });

            res.clearCookie('accessToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return res.status(401).json({
                message: 'Refresh token reuse detected. Please log in again.',
            });
        }

        if (
            result === 'NOT_FOUND' ||
            result === 'FAMILY_NOT_FOUND' ||
            result === 'FAMILY_REVOKED' ||
            result === 'INVALID_USER' ||
            result === 'INVALID_FAMILY'
        ) {
            return res.status(401).json({
                message: 'Refresh token is no longer valid.',
            });
        }

        if (result !== 'ROTATED') {
            return res.status(401).json({
                message: 'Refresh token rotation failed.',
            });
        }

        // 5. Create new access token.
        const accessToken = jwt.sign(
            {
                sub: String(userId),
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '15m',
            },
        );

        // 6. Replace refresh-token cookie.
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/auth/refresh',
        });

        // 7. Replace access-token cookie.
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        return res.status(200).json({
            message: 'Tokens refreshed.',
        });
    } catch (error) {
        console.error('Refresh error:', error);

        return res.status(401).json({
            message: 'Invalid or expired refresh token.',
        });
    }
}
