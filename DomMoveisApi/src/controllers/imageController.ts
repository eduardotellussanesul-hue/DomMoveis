import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

// ============================================
// 1. UPLOAD DE IMAGEM
// ============================================
export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhuma imagem enviada'
            });
        }

        const file = req.file;
        const folder = req.body.folder || 'dommoveis/produtos';

        // Upload para Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
            ]
        });

        // Remover arquivo temporário
        fs.unlinkSync(file.path);

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

    } catch (error: any) {
        // Limpar arquivo temporário se existir
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer upload'
        });
    }
};

// ============================================
// 2. UPLOAD DE MÚLTIPLAS IMAGENS
// ============================================
export const uploadMultipleImages = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        
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
                const result = await cloudinary.uploader.upload(file.path, {
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

                // Remover arquivo temporário
                fs.unlinkSync(file.path);
            } catch (err) {
                // Remover arquivo temporário mesmo em caso de erro
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                throw err;
            }
        }

        res.status(200).json({
            success: true,
            data: results,
            message: `${results.length} imagem(ns) enviada(s) com sucesso`
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao fazer upload'
        });
    }
};

// ============================================
// 3. BUSCAR IMAGEM POR PUBLIC ID
// ============================================
export const getImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;

        // Gerar URL da imagem com transformações
        const url = cloudinary.url(publicId, {
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

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar imagem'
        });
    }
};

// ============================================
// 4. LISTAR IMAGENS DE UMA PASTA
// ============================================
export const listImages = async (req: Request, res: Response) => {
    try {
        const { folder } = req.params;
        const maxResults = parseInt(req.query.maxResults as string) || 50;

        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: maxResults,
            resource_type: 'image'
        });

        // ✅ FIX: usar result.resources.length em vez de result.total_count
        const images = (result.resources || []).map((resource: any) => ({
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
                total: images.length,  // ✅ Usar length do array
                folder: folder
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar imagens'
        });
    }
};

// ============================================
// 5. DELETAR IMAGEM
// ============================================
export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Imagem deletada com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Imagem não encontrada'
            });
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar imagem'
        });
    }
};

// ============================================
// 6. DELETAR MÚLTIPLAS IMAGENS
// ============================================
export const deleteMultipleImages = async (req: Request, res: Response) => {
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
                const result = await cloudinary.uploader.destroy(publicId);
                results.push({
                    publicId,
                    success: result.result === 'ok'
                });
            } catch (err) {
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

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar imagens'
        });
    }
};

// ============================================
// 7. ATUALIZAR IMAGEM (TRANSFORMAÇÕES)
// ============================================
export const updateImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.params;
        const { transformation } = req.body;

        // Gerar URL com novas transformações
        const url = cloudinary.url(publicId, {
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

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar imagem'
        });
    }
};

// ============================================
// 8. BUSCAR IMAGENS POR TAG
// ============================================
export const getImagesByTag = async (req: Request, res: Response) => {
    try {
        const { tag } = req.params;
        const maxResults = parseInt(req.query.maxResults as string) || 50;

        const result = await cloudinary.api.resources_by_tag(tag, {
            max_results: maxResults,
            resource_type: 'image'
        });

        // ✅ FIX: usar result.resources.length em vez de result.total_count
        const images = (result.resources || []).map((resource: any) => ({
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
                total: images.length,  // ✅ Usar length do array
                tag: tag
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar imagens por tag'
        });
    }
};