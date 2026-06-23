import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import mongoose from 'mongoose';

// ============================================
// 1. CRIAR PRODUTO
// ============================================
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { nome, descricao, medidas, categoria, cor, preco, precoPromocional, estoque, imagens, destaque } = req.body;

        // Verifica se categoria existe
        const categoryExists = await Category.findById(categoria);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        const product = new Product({
            nome,
            descricao,
            medidas,
            categoria,
            cor,
            preco,
            precoPromocional,
            estoque: estoque || 0,
            imagens: imagens || [],
            destaque: destaque || false
        });

        await product.save();

        // Popula a categoria na resposta
        await product.populate('categoria', 'nome slug');

        res.status(201).json({
            success: true,
            data: product,
            message: 'Produto criado com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar produto'
        });
    }
};

// ============================================
// 2. LISTAR TODOS OS PRODUTOS
// ============================================
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, categoria, destaque, ativo, search } = req.query;

        const filter: any = {};
        
        if (categoria) filter.categoria = categoria;
        if (destaque === 'true') filter.destaque = true;
        if (ativo !== undefined) filter.ativo = ativo === 'true';
        if (search) {
            filter.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { descricao: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate('categoria', 'nome slug')
                .skip(skip)
                .limit(Number(limit))
                .sort({ dataCriacao: -1 }),
            Product.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar produtos'
        });
    }
};

// ============================================
// 3. BUSCAR PRODUTO POR ID
// ============================================
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const product = await Product.findById(id)
            .populate('categoria', 'nome slug descricao');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produto'
        });
    }
};

// ============================================
// 4. BUSCAR PRODUTO POR SLUG
// ============================================
export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug })
            .populate('categoria', 'nome slug descricao');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produto'
        });
    }
};

// ============================================
// 5. BUSCAR PRODUTOS POR CATEGORIA
// ============================================
export const getProductsByCategory = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'ID da categoria inválido'
            });
        }

        const products = await Product.find({
            categoria: categoryId,
            ativo: true
        }).populate('categoria', 'nome slug');

        res.status(200).json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produtos por categoria'
        });
    }
};

// ============================================
// 6. ATUALIZAR PRODUTO
// ============================================
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        // Verifica se categoria existe (se for atualizada)
        if (updates.categoria) {
            const categoryExists = await Category.findById(updates.categoria);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('categoria', 'nome slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: 'Produto atualizado com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar produto'
        });
    }
};

// ============================================
// 7. DESATIVAR PRODUTO (SOFT DELETE)
// ============================================
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { ativo: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: 'Produto desativado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao desativar produto'
        });
    }
};

// ============================================
// 8. REATIVAR PRODUTO
// ============================================
export const reactivateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { ativo: true },
            { new: true }
        ).populate('categoria', 'nome slug');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: 'Produto reativado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar produto'
        });
    }
};

// ============================================
// 9. DELETAR PRODUTO PERMANENTEMENTE
// ============================================
export const deleteProductPermanently = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Produto deletado permanentemente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar produto'
        });
    }
};

// ============================================
// 10. ATUALIZAR ESTOQUE
// ============================================
export const updateStock = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantidade } = req.body;

        if (quantidade === undefined || quantidade < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantidade deve ser um número positivo'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { estoque: quantidade },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product,
            message: 'Estoque atualizado com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar estoque'
        });
    }
};