"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';
const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
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
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            }
            catch (err) {
                if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                nome: decoded.nome
            };
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acesso negado. Permissão insuficiente.'
                });
            }
            return next();
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao validar token'
            });
        }
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authMiddleware.js.map