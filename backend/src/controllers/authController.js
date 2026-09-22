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
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 4. Set HttpOnly Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', //or strict
            maxAge: 3600000, // 1 hour
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
