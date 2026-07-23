import { Router } from 'express';
import {
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
    logout,
    countUsers,
    getMe
} from '../controllers/userController';
import { authorize } from '../middlewares/authMiddleware';
import { RoleType } from '../models/User';

const router = Router();

router.get('/me', authorize(), getMe);
router.get('/', authorize(), getAllUsers);
router.get('/:id', authorize(), getUserById);
router.get('/email/:email', authorize(), getUserByEmail);
router.get('/role/:role', authorize(), getUsersByRole);
router.get('/status/:status', authorize(), getUsersByStatus);
router.get('/count', authorize(), countUsers);
router.put('/:id', authorize(), updateUser);
router.put('/:id/password', authorize(), updatePassword);
router.put('/:id/last-access', authorize(), updateLastAccess);
router.delete('/:id', authorize(), deleteUser);
router.post('/logout/:id', authorize(), logout);

// 🔒 Apenas administradores
router.put('/:id/role', authorize(RoleType.Administrador), updateUserRole);
router.put('/:id/reactivate', authorize(RoleType.Administrador), reactivateUser);
router.delete('/:id/permanent', authorize(RoleType.Administrador), deleteUserPermanently);

export default router;