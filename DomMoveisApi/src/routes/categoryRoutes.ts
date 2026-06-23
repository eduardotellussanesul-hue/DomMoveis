import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    reactivateCategory,
    deleteCategoryPermanently
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { RoleType } from '../models/User';

const router = Router();

// ============================================
// ROTAS PÚBLICAS (não precisa de token)
// ============================================
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// ============================================
// ROTAS PROTEGIDAS (precisa de token)
// ============================================
router.use(authenticate); // ⚠️ Todas as rotas abaixo exigem autenticação!

// Rotas que exigem role ADMIN (3)
router.post('/', authorize(RoleType.Administrador), createCategory);
router.put('/:id', authorize(RoleType.Administrador), updateCategory);
router.delete('/:id', authorize(RoleType.Administrador), deleteCategory);
router.put('/:id/reactivate', authorize(RoleType.Administrador), reactivateCategory);
router.delete('/:id/permanent', authorize(RoleType.Administrador), deleteCategoryPermanently);

export default router;