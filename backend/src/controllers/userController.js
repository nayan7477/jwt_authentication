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
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
    }
    getUser(req, res, next, req.user.id);
}

export async function getAllUsersDetails(req, res, next) {
    try {
        const users = await allQuery.allUsersList();
        return res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
}

export const userController = {
    createUsers,
    getAllUsersDetails,
    getUser,
    getUserById,
    getCurrentUser,
    logout,
};
