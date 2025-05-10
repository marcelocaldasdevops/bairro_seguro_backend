import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';

interface AuthenticatedRequest extends Request {
    userId?: number;
}

interface JwtPayload {
    userId?: number;
    [key: string]: any; // Para outras propriedades que possam existir no token
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['x-access-token'] as string;

        if (!token) {
            res.status(401).json({ message: 'Token não fornecido' })
            return ;
        }

        console.log('Token recebido:', token); // Debug
        const decoded = jwt.decode(token, process.env.JWT_SECRET!) as JwtPayload;
        console.log('Token decodificado:', decoded); // Debug
        // Verificação robusta do payload
        if (typeof decoded !== 'object' || !decoded.userId) {
            console.error('Estrutura inválida do token:', decoded); // Debug
            res.status(401).json({ message: 'Token inválido: estrutura incorreta', expected: { userId: 'number' },
                received: decoded })
            return ;
        }

        // Defina o userId no request
        req.userId = decoded.userId;
        next()
        return ;
    } catch (error) {
        console.error('Error in authentication:', error);
        res.status(401).json({
            message: 'Falha na autenticação',
            details: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        return ;
    }
};