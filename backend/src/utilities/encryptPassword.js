import bcrypt from 'bcryptjs';

async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

export const hashed = async (password) => {
    const hashedPassword = await hashPassword(password);
    return hashedPassword;
};
