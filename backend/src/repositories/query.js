import { pool } from '../configs/pool.js';

export async function insertUser(email, hashedpassword, name, age) {
    await pool.query('INSERT INTO users (email, hashedpassword , name , age) VALUES ($1, $2 , $3 , $4)', [email, hashedpassword, name, age]);
}
export async function allUsersList() {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
}

export async function getUsersById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
}
export async function findUserByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
}

export const allQuery = { insertUser, findUserByEmail, allUsersList, getUsersById };
