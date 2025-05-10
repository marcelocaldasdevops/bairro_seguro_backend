import { pool } from '../config/db';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';

export class AuthService {
    static async findUserByEmailOrCPF(email: string, cpf: string): Promise<User | null> {
        const query = {
            text: `SELECT * FROM users WHERE email = $1 OR cpf = $2`,
            values: [email, cpf]
        };
        const result = await pool.query(query);
        return result.rows[0] || null;
    }

    static async createUser(userData: Omit<User, 'userID' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const query = {
            text: `INSERT INTO users (name, email, password, cpf, bairro)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            values: [
                userData.name,
                userData.email,
                hashedPassword,
                userData.cpf,
                userData.bairro
            ]
        };
        const result = await pool.query(query);
        return result.rows[0];
    }

    static async validateUserCredentials(email: string, password: string): Promise<User | null> {
        const query = {
            text: `SELECT * FROM users WHERE email = $1`,
            values: [email]
        };
        const result = await pool.query(query);
        const user = result.rows[0];

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }
}