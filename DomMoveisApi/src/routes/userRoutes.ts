import { Router } from 'express';
import {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUsersByRole,
    getUsersByStatus,
    updateUser,
    updateUserRole,
    updatePassword,
    updateLastAccess,
    deleteUser,
    reactivateUser,
    deleteUserPermanently,
    login,
    refreshToken,
    logout,
    countUsers
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { RoleType } from '../models/User';

const router = Router();

// ============================================
// ROTAS PÚBLICAS (SEM TOKEN)
// ============================================
router.post('/auth/login', login);
router.post('/auth/refresh-token', refreshToken);
router.post('/users', createUser);  // Cadastro aberto

// ============================================
// ROTAS PROTEGIDAS (COM TOKEN)
// ============================================
router.use(authenticate); // ⚠️ Todas as rotas abaixo exigem token!

// Usuários (qualquer usuário logado)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/email/:email', getUserByEmail);
router.get('/users/role/:role', getUsersByRole);
router.get('/users/status/:status', getUsersByStatus);
router.get('/users/count', countUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/password', updatePassword);
router.put('/users/:id/last-access', updateLastAccess);
router.delete('/users/:id', deleteUser);
router.post('/auth/logout/:id', logout);

// Rotas que exigem role específica (ADMIN)
router.put('/users/:id/role', authorize(RoleType.Administrador), updateUserRole);
router.put('/users/:id/reactivate', authorize(RoleType.Administrador), reactivateUser);
router.delete('/users/:id/permanent', authorize(RoleType.Administrador), deleteUserPermanently);

export default router;