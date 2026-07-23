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
import { authorize } from '../middlewares/authMiddleware';
import { RoleType } from '../models/User';

const router = Router();

// Rotas públicas
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Rotas protegidas (admin)
router.post('/', authorize(RoleType.Administrador), createCategory);
router.put('/:id', authorize(RoleType.Administrador), updateCategory);
router.delete('/:id', authorize(RoleType.Administrador), deleteCategory);
router.put('/:id/reactivate', authorize(RoleType.Administrador), reactivateCategory);
router.delete('/:id/permanent', authorize(RoleType.Administrador), deleteCategoryPermanently);

export default router;