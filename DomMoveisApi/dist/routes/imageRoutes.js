"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageController_1 = require("../controllers/imageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const upload_1 = require("../middlewares/upload");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/:publicId', imageController_1.getImage);
router.get('/list/:folder', imageController_1.listImages);
router.get('/tag/:tag', imageController_1.getImagesByTag);
router.post('/upload', (0, authMiddleware_1.authorize)(User_1.RoleType.Administrador), upload_1.upload.single('image'), imageController_1.uploadImage);
router.post('/upload-multiple', (0, authMiddleware_1.authorize)(User_1.RoleType.Administrador), upload_1.uploadMultiple, imageController_1.uploadMultipleImages);
router.delete('/:publicId', (0, authMiddleware_1.authorize)(User_1.RoleType.Administrador), imageController_1.deleteImage);
router.post('/delete-multiple', (0, authMiddleware_1.authorize)(User_1.RoleType.Administrador), imageController_1.deleteMultipleImages);
router.put('/:publicId', (0, authMiddleware_1.authorize)(User_1.RoleType.Administrador), imageController_1.updateImage);
exports.default = router;
//# sourceMappingURL=imageRoutes.js.map