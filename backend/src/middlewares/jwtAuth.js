import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    // 1. Extract token from HttpOnly cookie, or fall back to Bearer header
    let token = req.cookies?.token;

    // 2. Reject if no token is found
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    // 3. Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }

        // 4. Attach payload to req.user for downstream middleware/controllers
        req.user = decoded;
        next();
    });
}
