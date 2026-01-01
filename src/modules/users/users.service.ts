import { pool } from "../../config/db";

const getUsers = async () => {
     const result = await pool.query(`SELECT id, name, email, phone, role FROM users`);
     return result.rows;
}

const updateUserInfo = async (userId: number, data: Partial<any>) => {
     const result = await pool.query(
          `UPDATE users SET name = $1, email = $2, phone = $3, role = $4 WHERE id = $5 RETURNING id, name, email, phone, role`,
          [data.name, data.email, data.phone, data.role, userId]
     );
     return result.rows[0];
}

const removeUser = async (userId: number) => {
     const result = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
     return result.rows[0];
}

export {
     getUsers,
     updateUserInfo,
     removeUser
};