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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    static findUserByEmailOrCPF(email, cpf) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: `SELECT * FROM users WHERE email = $1 OR cpf = $2`,
                values: [email, cpf]
            };
            const result = yield db_1.pool.query(query);
            return result.rows[0] || null;
        });
    }
    static createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
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
            const result = yield db_1.pool.query(query);
            return result.rows[0];
        });
    }
    static validateUserCredentials(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: `SELECT * FROM users WHERE email = $1`,
                values: [email]
            };
            const result = yield db_1.pool.query(query);
            const user = result.rows[0];
            if (!user)
                return null;
            const isValid = yield bcrypt_1.default.compare(password, user.password);
            return isValid ? user : null;
        });
    }
}
exports.AuthService = AuthService;
