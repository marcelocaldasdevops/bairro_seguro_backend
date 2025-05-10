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
exports.authenticate = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            res.status(401).json({ message: 'Token não fornecido' });
            return;
        }
        console.log('Token recebido:', token); // Debug
        const decoded = jwt_simple_1.default.decode(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded); // Debug
        // Verificação robusta do payload
        if (typeof decoded !== 'object' || !decoded.userId) {
            console.error('Estrutura inválida do token:', decoded); // Debug
            res.status(401).json({ message: 'Token inválido: estrutura incorreta', expected: { userId: 'number' },
                received: decoded });
            return;
        }
        // Defina o userId no request
        req.userId = decoded.userId;
        next();
        return;
    }
    catch (error) {
        console.error('Error in authentication:', error);
        res.status(401).json({
            message: 'Falha na autenticação',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
        return;
    }
});
exports.authenticate = authenticate;
