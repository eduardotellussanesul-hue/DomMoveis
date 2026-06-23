"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countUsers = exports.logout = exports.refreshToken = exports.login = exports.deleteUserPermanently = exports.reactivateUser = exports.deleteUser = exports.updateLastAccess = exports.updatePassword = exports.updateUserRole = exports.updateUser = exports.getUsersByStatus = exports.getUsersByRole = exports.getUserByEmail = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_jwt_secret_aqui';
const createUser = async (req, res) => {
    try {
        const { nome, email, senha, telefone, role } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email já cadastrado'
            });
        }
        const user = new User_1.User({
            nome,
            email: email.toLowerCase(),
            senha,
            telefone: telefone || null,
            role: role || User_1.RoleType.Usuario,
            ativo: true,
            dataCriacao: new Date()
        });
        await user.save();
        const userResponse = user.toJSON();
        ;
        delete userResponse.senha;
        delete userResponse.refreshToken;
        delete userResponse.refreshTokenExpiracao;
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Usuário criado com sucesso'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar usuário'
        });
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const onlyActive = req.query.onlyActive === 'true';
        const filter = {};
        if (onlyActive) {
            filter.ativo = true;
        }
        const [users, total] = await Promise.all([
            User_1.User.find(filter)
                .select('-senha -refreshToken -refreshTokenExpiracao')
                .skip(skip)
                .limit(limit)
                .sort({ dataCriacao: -1 }),
            User_1.User.countDocuments(filter)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar usuários'
        });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findById(id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuário'
        });
    }
};
exports.getUserById = getUserById;
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User_1.User.findOne({ email: email.toLowerCase() })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuário'
        });
    }
};
exports.getUserByEmail = getUserByEmail;
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const roleNumber = parseInt(role);
        if (isNaN(roleNumber) || !Object.values(User_1.RoleType).includes(roleNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Role inválida. Valores: 0, 1, 2, 3'
            });
        }
        const users = await User_1.User.find({ role: roleNumber, ativo: true })
            .select('-senha -refreshToken -refreshTokenExpiracao')
            .sort({ nome: 1 });
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuários por role'
        });
    }
};
exports.getUsersByRole = getUsersByRole;
const getUsersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const ativo = status === 'active';
        const users = await User_1.User.find({ ativo })
            .select('-senha -refreshToken -refreshTokenExpiracao')
            .sort({ dataCriacao: -1 });
        res.status(200).json({
            success: true,
            data: users,
            count: users.length,
            status: ativo ? 'Ativos' : 'Inativos'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar usuários por status'
        });
    }
};
exports.getUsersByStatus = getUsersByStatus;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        delete updates._id;
        delete updates.dataCriacao;
        delete updates.senha;
        delete updates.role;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        if (updates.email) {
            const existingEmail = await User_1.User.findOne({
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
        const user = await User_1.User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-senha -refreshToken -refreshTokenExpiracao');
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar usuário'
        });
    }
};
exports.updateUser = updateUser;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (role === undefined || !Object.values(User_1.RoleType).includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role inválida. Valores permitidos: 0, 1, 2, 3'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findByIdAndUpdate(id, { role }, { new: true }).select('-senha -refreshToken -refreshTokenExpiracao');
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar role'
        });
    }
};
exports.updateUserRole = updateUserRole;
const updatePassword = async (req, res) => {
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
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findById(id).select('+senha');
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar senha'
        });
    }
};
exports.updatePassword = updatePassword;
const updateLastAccess = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar último acesso'
        });
    }
};
exports.updateLastAccess = updateLastAccess;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findByIdAndUpdate(id, { ativo: false }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar usuário'
        });
    }
};
exports.deleteUser = deleteUser;
const reactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findByIdAndUpdate(id, { ativo: true }, { new: true }).select('-senha -refreshToken -refreshTokenExpiracao');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar usuário'
        });
    }
};
exports.reactivateUser = reactivateUser;
const deleteUserPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar usuário permanentemente'
        });
    }
};
exports.deleteUserPermanently = deleteUserPermanently;
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() })
            .select('+senha +refreshToken +refreshTokenExpiracao');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
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
                message: 'Credenciais inválidas'
            });
        }
        await user.updateLastAccess();
        const accessToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            nome: user.nome
        }, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        user.refreshTokenExpiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await user.save();
        const userResponse = user.toJSON();
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao realizar login'
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token é obrigatório'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.User.findById(decoded.id)
            .select('+refreshToken +refreshTokenExpiracao');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        if (user.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token inválido'
            });
        }
        if (user.refreshTokenExpiracao && user.refreshTokenExpiracao < new Date()) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado. Faça login novamente'
            });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            nome: user.nome
        }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: 3600
            },
            message: 'Token atualizado com sucesso'
        });
    }
    catch (error) {
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
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const user = await User_1.User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }
        user.refreshToken = undefined;
        user.refreshTokenExpiracao = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer logout'
        });
    }
};
exports.logout = logout;
const countUsers = async (req, res) => {
    try {
        const total = await User_1.User.countDocuments();
        const active = await User_1.User.countDocuments({ ativo: true });
        const inactive = await User_1.User.countDocuments({ ativo: false });
        const roles = await User_1.User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao contar usuários'
        });
    }
};
exports.countUsers = countUsers;
function getRoleName(role) {
    switch (role) {
        case User_1.RoleType.Usuario:
            return 'Usuário';
        case User_1.RoleType.Vendedor:
            return 'Vendedor';
        case User_1.RoleType.Gerente:
            return 'Gerente';
        case User_1.RoleType.Administrador:
            return 'Administrador';
        default:
            return 'Desconhecido';
    }
}
