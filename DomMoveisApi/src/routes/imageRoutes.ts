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
import { authorize } from '../middlewares/authMiddleware';
import { upload, uploadMultiple } from '../middlewares/upload';
import { RoleType } from '../models/User';

const router = Router();

// Rotas públicas
router.get('/:publicId', getImage);
router.get('/list/:folder', listImages);
router.get('/tag/:tag', getImagesByTag);

// Rotas protegidas (admin)
router.post('/upload', authorize(RoleType.Administrador), upload.single('image'), uploadImage);
router.post('/upload-multiple', authorize(RoleType.Administrador), uploadMultiple, uploadMultipleImages);
router.delete('/:publicId', authorize(RoleType.Administrador), deleteImage);
router.post('/delete-multiple', authorize(RoleType.Administrador), deleteMultipleImages);
router.put('/:publicId', authorize(RoleType.Administrador), updateImage);

export default router;