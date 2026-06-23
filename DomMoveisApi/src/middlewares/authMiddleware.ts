import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: number;
        nome: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1. Pegar o token do header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        // 2. Verificar se é Bearer token
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer <token>'
            });
        }

        const token = parts[1];

        // 3. Validar o token
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                id: string;
                email: string;
                role: number;
                nome: string;
            };

            // 4. Adicionar os dados do usuário na requisição
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                nome: decoded.nome
            };

            return next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado. Faça login novamente.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erro ao validar token'
        });
    }
};

// Middleware para verificar role (opcional)
export const authorize = (...roles: number[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Permissão insuficiente.'
            });
        }

        return next();
    };
};