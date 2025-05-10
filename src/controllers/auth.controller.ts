import { RequestHandler } from 'express';
import { pool } from '../config/db';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt';

const saltRounds = 10;

export class AuthController {
    static register: RequestHandler = async (req , res) => {
        const client = await pool.connect();
        try {
            const { name, email, password, cpf, bairro } = req.body;

            await client.query('BEGIN');

            // Verificar se usuário já existe
            const existingUser = await client.query(
                `SELECT * FROM users WHERE email = $1 OR cpf = $2`,
                [email, cpf]
            );

            if (existingUser.rows.length > 0) {
                await client.query('ROLLBACK');
                res.status(400).json({ message: 'Usuário já cadastrado' })
                return ;
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Inserir novo usuário - RETORNANDO TODAS AS COLUNAS
            const result = await client.query(
                `INSERT INTO users (name, email, password, cpf, bairro)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,  // Retorna todas as colunas
                [name, email, hashedPassword, cpf, bairro]
            );

            await client.query('COMMIT');

            const user = result.rows[0];

            // Verifique qual é o nome da coluna do ID
            console.log('Colunas retornadas:', Object.keys(user));

            // Use user.id ou user.user_id conforme o banco retornar
            const userId = user.id || user.user_id || user.userID;

            if (!userId) {
                throw new Error(`ID do usuário não encontrado. Colunas disponíveis: ${Object.keys(user).join(', ')}`);
            }

            const token = jwt.encode({ userId }, process.env.JWT_SECRET!);

            res.status(201).json({
                user: {
                    id: userId,
                    name: user.name,
                    email: user.email,
                    bairro: user.bairro
                    // Não retorne a senha!
                },
                token
            })
            return ;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error registering user:', error);
            res.status(500).json({
                message: 'Erro ao cadastrar usuário',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            })
            return ;
        } finally {
            client.release();
        }
    };


    static login: RequestHandler = async (req, res) => {
        try {
            const { email, password } = req.body;

            const result = await pool.query(
                `SELECT * FROM users WHERE email = $1`,
                [email]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            const user = result.rows[0];

            // Verificação da senha - note que acessamos user.password diretamente
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                res.status(401).json({ message: 'Credenciais inválidas' });
                return;
            }

            // Obter o ID do usuário - verifique qual coluna seu banco retorna
            const userId = user.id || user.user_id || user.userID;

            if (!userId) {
                throw new Error('ID do usuário não encontrado no objeto retornado');
            }

            // Gerar token
            const token = jwt.encode({ userId }, process.env.JWT_SECRET!);

            // Retornar os dados do usuário (excluindo a senha)
            const { password: _, ...userData } = user; // Remove a senha do objeto

            res.json({
                user: userData,
                token
            });

        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({
                message: 'Erro ao fazer login',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    };
}