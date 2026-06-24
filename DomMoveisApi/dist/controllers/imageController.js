"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImagesByTag = exports.updateImage = exports.deleteMultipleImages = exports.deleteImage = exports.listImages = exports.getImage = exports.uploadMultipleImages = exports.uploadImage = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma imagem enviada'
            });
        }
        const file = req.file;
        const folder = req.body.folder || 'dommoveis/produtos';
        const result = await cloudinary_1.default.uploader.upload(file.path, {
            folder: folder,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });
        fs_1.default.unlinkSync(file.path);
        res.status(200).json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
            },
            message: 'Imagem enviada com sucesso'
        });
    }
    catch (error) {
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer upload'
        });
    }
};
exports.uploadImage = uploadImage;
const uploadMultipleImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma imagem enviada'
            });
        }
        const folder = req.body.folder || 'dommoveis/produtos';
        const results = [];
        for (const file of files) {
            try {
                const result = await cloudinary_1.default.uploader.upload(file.path, {
                    folder: folder,
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                });
                results.push({
                    url: result.secure_url,
                    publicId: result.public_id
                });
                fs_1.default.unlinkSync(file.path);
            }
            catch (err) {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
                throw err;
            }
        }
        res.status(200).json({
            success: true,
            data: results,
            message: `${results.length} imagem(ns) enviada(s) com sucesso`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer upload'
        });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
const getImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        const url = cloudinary_1.default.url(publicId, {
            secure: true,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });
        res.status(200).json({
            success: true,
            data: {
                url: url,
                publicId: publicId
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar imagem'
        });
    }
};
exports.getImage = getImage;
const listImages = async (req, res) => {
    try {
        const { folder } = req.params;
        const maxResults = parseInt(req.query.maxResults) || 50;
        const result = await cloudinary_1.default.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: maxResults,
            resource_type: 'image'
        });
        const images = (result.resources || []).map((resource) => ({
            url: resource.secure_url,
            publicId: resource.public_id,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            bytes: resource.bytes,
            createdAt: resource.created_at
        }));
        res.status(200).json({
            success: true,
            data: {
                images,
                total: images.length,
                folder: folder
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar imagens'
        });
    }
};
exports.listImages = listImages;
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinary_1.default.uploader.destroy(publicId);
        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Imagem deletada com sucesso'
            });
        }
        else {
            res.status(404).json({
                success: false,
                message: 'Imagem não encontrada'
            });
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar imagem'
        });
    }
};
exports.deleteImage = deleteImage;
const deleteMultipleImages = async (req, res) => {
    try {
        const { publicIds } = req.body;
        if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Lista de publicIds é obrigatória'
            });
        }
        const results = [];
        for (const publicId of publicIds) {
            try {
                const result = await cloudinary_1.default.uploader.destroy(publicId);
                results.push({
                    publicId,
                    success: result.result === 'ok'
                });
            }
            catch (err) {
                results.push({
                    publicId,
                    success: false,
                    error: 'Erro ao deletar'
                });
            }
        }
        const successCount = results.filter(r => r.success).length;
        res.status(200).json({
            success: true,
            data: {
                results,
                total: results.length,
                successCount,
                failedCount: results.length - successCount
            },
            message: `${successCount} imagem(ns) deletada(s) com sucesso`
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar imagens'
        });
    }
};
exports.deleteMultipleImages = deleteMultipleImages;
const updateImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        const { transformation } = req.body;
        const url = cloudinary_1.default.url(publicId, {
            secure: true,
            transformation: transformation || [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });
        res.status(200).json({
            success: true,
            data: {
                url,
                publicId
            },
            message: 'URL da imagem atualizada'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar imagem'
        });
    }
};
exports.updateImage = updateImage;
const getImagesByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const maxResults = parseInt(req.query.maxResults) || 50;
        const result = await cloudinary_1.default.api.resources_by_tag(tag, {
            max_results: maxResults,
            resource_type: 'image'
        });
        const images = (result.resources || []).map((resource) => ({
            url: resource.secure_url,
            publicId: resource.public_id,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            bytes: resource.bytes,
            createdAt: resource.created_at
        }));
        res.status(200).json({
            success: true,
            data: {
                images,
                total: images.length,
                tag: tag
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar imagens por tag'
        });
    }
};
exports.getImagesByTag = getImagesByTag;
