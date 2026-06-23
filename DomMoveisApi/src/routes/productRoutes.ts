import { Router } from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
    reactivateProduct,
    deleteProductPermanently,
    updateStock
} from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { RoleType } from '../models/User';

const router = Router();

// Rotas públicas (qualquer um pode ver)
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);
router.get('/category/:categoryId', getProductsByCategory);

// Rotas protegidas (apenas admin)
router.use(authenticate);
router.post('/', authorize(RoleType.Administrador), createProduct);
router.put('/:id', authorize(RoleType.Administrador), updateProduct);
router.put('/:id/stock', authorize(RoleType.Administrador), updateStock);
router.delete('/:id', authorize(RoleType.Administrador), deleteProduct);
router.put('/:id/reactivate', authorize(RoleType.Administrador), reactivateProduct);
router.delete('/:id/permanent', authorize(RoleType.Administrador), deleteProductPermanently);

export default router;