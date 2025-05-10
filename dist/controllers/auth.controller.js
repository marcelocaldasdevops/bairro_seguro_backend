"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const db_1 = require("../config/db");
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 10;
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.pool.connect();
    try {
        const { name, email, password, cpf, bairro } = req.body;
        yield client.query('BEGIN');
        // Verificar se usuário já existe
        const existingUser = yield client.query(`SELECT * FROM users WHERE email = $1 OR cpf = $2`, [email, cpf]);
        if (existingUser.rows.length > 0) {
            yield client.query('ROLLBACK');
            res.status(400).json({ message: 'Usuário já cadastrado' });
            return;
        }
        // Hash da senha
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        // Inserir novo usuário - RETORNANDO TODAS AS COLUNAS
        const result = yield client.query(`INSERT INTO users (name, email, password, cpf, bairro)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`, // Retorna todas as colunas
        [name, email, hashedPassword, cpf, bairro]);
        yield client.query('COMMIT');
        const user = result.rows[0];
        // Verifique qual é o nome da coluna do ID
        console.log('Colunas retornadas:', Object.keys(user));
        // Use user.id ou user.user_id conforme o banco retornar
        const userId = user.id || user.user_id || user.userID;
        if (!userId) {
            throw new Error(`ID do usuário não encontrado. Colunas disponíveis: ${Object.keys(user).join(', ')}`);
        }
        const token = jwt_simple_1.default.encode({ userId }, process.env.JWT_SECRET);
        res.status(201).json({
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                bairro: user.bairro
                // Não retorne a senha!
            },
            token
        });
        return;
    }
    catch (error) {
        yield client.query('ROLLBACK');
        console.error('Error registering user:', error);
        res.status(500).json({
            message: 'Erro ao cadastrar usuário',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        return;
    }
    finally {
        client.release();
    }
});
AuthController.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const result = yield db_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Usuário não encontrado' });
            return;
        }
        const user = result.rows[0];
        // Verificação da senha - note que acessamos user.password diretamente
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
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
        const token = jwt_simple_1.default.encode({ userId }, process.env.JWT_SECRET);
        // Retornar os dados do usuário (excluindo a senha)
        const { password: _ } = user, userData = __rest(user, ["password"]); // Remove a senha do objeto
        res.json({
            user: userData,
            token
        });
    }
    catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            message: 'Erro ao fazer login',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
    }
});
