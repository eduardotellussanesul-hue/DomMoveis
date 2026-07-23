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

/**
 * Middleware que autentica (valida token) e autoriza (verifica role).
 * Uso: router.post('/rota', authorize(RoleType.Administrador), handler)
 */
export const authorize = (...roles: number[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // 1. Extrair token
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: 'Token não fornecido'
                });
            }

            const parts = authHeader.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                return res.status(401).json({
                    success: false,
                    message: 'Formato de token inválido. Use: Bearer <token>'
                });
            }

            const token = parts[1];

            // 2. Verificar token
            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET) as {
                    id: string;
                    email: string;
                    role: number;
                    nome: string;
                };
            } catch (err) {
                if (err instanceof jwt.TokenExpiredError) {
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

            // 3. Preencher req.user
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                nome: decoded.nome
            };

            // 4. Verificar role (se roles foi passado)
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Permissão insuficiente.'
                });
            }

            return next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao validar token'
            });
        }
    };
};