import { Request, Response } from 'express';
import { User, IUser, RoleType } from '../models/User';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '';

// ============================================
// 1. CRIAR USUÁRIO
// ============================================
export const createUser = async (req: Request, res: Response) => {
    try {
        const { nome, email, senha, telefone, role } = req.body;

        // Verifica se email já existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }

        // Cria o usuário
        const user = new User({
            nome,
            email: email.toLowerCase(),
            senha,
            telefone: telefone || null,
            role: role || RoleType.Usuario,
            ativo: true,
            dataCriacao: new Date()
        });

        await user.save();

        // Remove senha da resposta
        const userResponse = user.toJSON() as any;;
        delete userResponse.senha;
        delete userResponse.refreshToken;
        delete userResponse.refreshTokenExpiracao;

        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Usuário criado com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar usuário'
        });
    }
};

// ============================================
// 2. LISTAR TODOS OS USUÁRIOS
// ============================================
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const onlyActive = req.query.onlyActive === 'true';

        const filter: any = {};
        if (onlyActive) {
            filter.ativo = true;
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-senha -refreshToken -refreshTokenExpiracao')
                .skip(skip)
                .limit(limit)
                .sort({ dataCriacao: -1 }),
            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar usuários'
        });
    }
};

// ============================================
// 3. BUSCAR USUÁRIO POR ID
// ============================================
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findById(id)
            .select('-senha -refreshToken -refreshTokenExpiracao');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuário'
        });
    }
};

// ============================================
// 4. BUSCAR USUÁRIO POR EMAIL
// ============================================
export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('-senha -refreshToken -refreshTokenExpiracao');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuário'
        });
    }
};

// ============================================
// 5. BUSCAR USUÁRIO POR ROLE
// ============================================
export const getUsersByRole = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;
        const roleNumber = parseInt(role);

        if (isNaN(roleNumber) || !Object.values(RoleType).includes(roleNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Role inválida. Valores: 0, 1, 2, 3'
            });
        }

        const users = await User.find({ role: roleNumber, ativo: true })
            .select('-senha -refreshToken -refreshTokenExpiracao')
            .sort({ nome: 1 });

        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuários por role'
        });
    }
};

// ============================================
// 6. BUSCAR USUÁRIOS ATIVOS/INATIVOS
// ============================================
export const getUsersByStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.params;
        const ativo = status === 'active';

        const users = await User.find({ ativo })
            .select('-senha -refreshToken -refreshTokenExpiracao')
            .sort({ dataCriacao: -1 });

        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
            status: ativo ? 'Ativos' : 'Inativos'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuários por status'
        });
    }
};

// ============================================
// 7. ATUALIZAR USUÁRIO
// ============================================
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove campos que não podem ser atualizados diretamente
        delete updates._id;
        delete updates.dataCriacao;
        delete updates.senha;
        delete updates.role;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        // Verifica se email já existe em outro usuário
        if (updates.email) {
            const existingEmail = await User.findOne({
                email: updates.email.toLowerCase(),
                _id: { $ne: id }
            });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado por outro usuário'
                });
            }
            updates.email = updates.email.toLowerCase();
        }

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-senha -refreshToken -refreshTokenExpiracao');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Usuário atualizado com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar usuário'
        });
    }
};

// ============================================
// 8. ATUALIZAR ROLE DO USUÁRIO
// ============================================
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (role === undefined || !Object.values(RoleType).includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role inválida. Valores permitidos: 0, 1, 2, 3'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-senha -refreshToken -refreshTokenExpiracao');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: `Role atualizada para: ${user.roleName}`
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar role'
        });
    }
};

// ============================================
// 9. ATUALIZAR SENHA
// ============================================
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual e nova senha são obrigatórias'
            });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Nova senha deve ter no mínimo 6 caracteres'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findById(id).select('+senha');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const isPasswordValid = await user.comparePassword(senhaAtual);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        user.senha = novaSenha;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Senha atualizada com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar senha'
        });
    }
};

// ============================================
// 10. ATUALIZAR ÚLTIMO ACESSO
// ============================================
export const updateLastAccess = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        await user.updateLastAccess();

        res.status(200).json({
            success: true,
            data: { ultimoAcesso: user.ultimoAcesso },
            message: 'Último acesso atualizado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar último acesso'
        });
    }
};

// ============================================
// 11. DELETAR USUÁRIO (SOFT DELETE)
// ============================================
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { ativo: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: { id: user._id, nome: user.nome },
            message: 'Usuário desativado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar usuário'
        });
    }
};

// ============================================
// 12. REATIVAR USUÁRIO
// ============================================
export const reactivateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { ativo: true },
            { new: true }
        ).select('-senha -refreshToken -refreshTokenExpiracao');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user,
            message: 'Usuário reativado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar usuário'
        });
    }
};

// ============================================
// 13. DELETAR USUÁRIO PERMANENTEMENTE
// ============================================
export const deleteUserPermanently = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuário deletado permanentemente com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar usuário permanentemente'
        });
    }
};

// ============================================
// 14. LOGIN
// ============================================
export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios',
                details: {
                    email: !email ? 'Email não fornecido' : 'Ok',
                    senha: !senha ? 'Senha não fornecida' : 'Ok'
                }
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+senha');


        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas',
                details: {
                    email: email.toLowerCase(),
                    found: false,
                    reason: 'Usuário não encontrado com este email'
                }
            });
        }

        if (!user.ativo) {
            return res.status(401).json({
                success: false,
                message: 'Usuário desativado. Entre em contato com o administrador'
            });
        }

        const isPasswordValid = await user.comparePassword(senha);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas',
                details: {
                    email: senha.toLowerCase(),
                    found: false,
                    reason: 'Usuário não encontrado com este email'
                }
            });
        }

        await user.updateLastAccess();

        const accessToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                nome: user.nome 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await user.save();

        const userResponse = user.toJSON() as any;
        delete userResponse.senha;
        delete userResponse.refreshToken;
        delete userResponse.refreshTokenExpiracao;

        res.status(200).json({
            success: true,
            data: {
                user: userResponse,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600
                }
            },
            message: 'Login realizado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao realizar login'
        });
    }
};

// ============================================
// 15. REFRESH TOKEN
// ============================================
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token é obrigatório'
            });
        }

        // Verifica o refresh token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const user = await User.findById(decoded.id)
            .select('+refreshToken +refreshTokenExpiracao');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Verifica se o refresh token é válido
        if (user.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido'
            });
        }

        // Verifica se o refresh token expirou
        if (user.refreshTokenExpiracao && user.refreshTokenExpiracao < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado. Faça login novamente'
            });
        }

        // Gera novo access token
        const newAccessToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                nome: user.nome 
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: 3600
            },
            message: 'Token atualizado com sucesso'
        });
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado. Faça login novamente'
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar token'
        });
    }
};

// ============================================
// 16. LOGOUT
// ============================================
export const logout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Remove o refresh token
        user.refreshToken = undefined;
        user.refreshTokenExpiracao = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer logout'
        });
    }
};

// ============================================
// 17. CONTAR USUÁRIOS
// ============================================
export const countUsers = async (req: Request, res: Response) => {
    try {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ ativo: true });
        const inactive = await User.countDocuments({ ativo: false });

        // Contagem por role
        const roles = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Mapeia os nomes das roles
        const rolesMap = roles.map(r => ({
            role: r._id,
            name: getRoleName(r._id),
            count: r.count
        }));

        res.status(200).json({
            success: true,
            data: {
                total,
                active,
                inactive,
                byRole: rolesMap
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao contar usuários'
        });
    }
};
// ============================================
// 18. BUSCAR USUÁRIO ATUAL (ME)
// ============================================
export const getMe = async (req: Request, res: Response) => {
    try {
        // O usuário já está no req.user (adicionado pelo middleware authenticate)
        const userId = (req as any).user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não autenticado'
            });
        }

        const user = await User.findById(userId)
            .select('-senha -refreshToken -refreshTokenExpiracao');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuário'
        });
    }
};

// Função auxiliar para nome da role
function getRoleName(role: number): string {
    switch (role) {
        case RoleType.Usuario:
            return 'Usuário';
        case RoleType.Vendedor:
            return 'Vendedor';
        case RoleType.Gerente:
            return 'Gerente';
        case RoleType.Administrador:
            return 'Administrador';
        default:
            return 'Desconhecido';
    }
}