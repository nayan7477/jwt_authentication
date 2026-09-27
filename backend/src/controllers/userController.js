import { allQuery } from '../repositories/query.js';
import { hashed } from '../utilities/encryptPassword.js';

export async function createUsers(req, res, next) {
    try {
        const { email, password, name, age } = req.body;
        const hashedpassword = await hashed(password);
        await allQuery.insertUser(email, hashedpassword, name, age);
        return res.status(201).json({ message: 'Success', email, name, age });
    } catch (error) {
        next(error); // write logic for sql error using status code that is shown when a user already exists
    }
}

export async function getUser(req, res, next, targetId) {
    try {
        const userId = parseInt(targetId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({
                message: 'Invalid user ID format',
            });
        }

        const user = await allQuery.getUsersById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export function getUserById(req, res, next) {
    getUser(req, res, next, req.params.id);
}

// Cleaned up for JWT: Assumes JWT middleware attached decoded user to req.user
export function getCurrentUser(req, res, next) {
    if (!req.user || !req.user.sub) {
        return res.status(401).json({
            message: 'Not authenticated. Please log in first.',
        });
    }
    getUser(req, res, next, req.user.sub);
}

export async function getAllUsersDetails(req, res, next) {
    try {
        const users = await allQuery.allUsersList();
        return res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export async function logout(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

                if (decoded.familyId) {
                    await revokeFamily(decoded.familyId);
                }
            } catch {
                // Token may already be expired/invalid.
                // We still clear the cookies.
            }
        }

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

        return res.status(200).json({
            message: 'Logged out successfully.',
        });
    } catch (error) {
        console.error('Logout error:', error);

        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

export const userController = {
    createUsers,
    getAllUsersDetails,
    getUser,
    getUserById,
    getCurrentUser,
    logout,
};
