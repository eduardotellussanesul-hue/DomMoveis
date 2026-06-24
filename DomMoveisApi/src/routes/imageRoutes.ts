import { Router } from 'express';
import {
    uploadImage,
    uploadMultipleImages,
    getImage,
    listImages,
    deleteImage,
    deleteMultipleImages,
    updateImage,
    getImagesByTag
} from '../controllers/imageController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { upload, uploadMultiple } from '../middlewares/upload';
import { RoleType } from '../models/User';

const router = Router();

// ============================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================
// GET /api/images/:publicId
router.get('/:publicId', getImage);
// GET /api/images/list/:folder
router.get('/list/:folder', listImages);
// GET /api/images/tag/:tag
router.get('/tag/:tag', getImagesByTag);

// ============================================
// ROTAS PROTEGIDAS (apenas ADMIN)
// ============================================
// Todas as rotas abaixo exigem autenticação e role ADMIN
router.use(authenticate);
router.use(authorize(RoleType.Administrador));

// POST /api/images/upload
router.post('/upload', upload.single('image'), uploadImage);
// POST /api/images/upload-multiple
router.post('/upload-multiple', uploadMultiple, uploadMultipleImages);

// DELETE /api/images/:publicId
router.delete('/:publicId', deleteImage);
// POST /api/images/delete-multiple
router.post('/delete-multiple', deleteMultipleImages);

// PUT /api/images/:publicId
router.put('/:publicId', updateImage);

export default router;