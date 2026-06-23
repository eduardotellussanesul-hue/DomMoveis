import { Request, Response } from 'express';
import { Category, ICategory } from '../models/Category';
import mongoose from 'mongoose';

// ============================================
// 1. CRIAR CATEGORIA
// ============================================
export const createCategory = async (req: Request, res: Response) => {
    try {
        const { nome, descricao } = req.body;

        // Verifica se já existe
        const existing = await Category.findOne({ nome });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Categoria já existe'
            });
        }

        const category = new Category({ nome, descricao });
        await category.save();

        res.status(201).json({
            success: true,
            data: category,
            message: 'Categoria criada com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar categoria'
        });
    }
};

// ============================================
// 2. LISTAR TODAS AS CATEGORIAS
// ============================================
export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const { ativo } = req.query;
        const filter: any = {};
        
        if (ativo !== undefined) {
            filter.ativo = ativo === 'true';
        }

        const categories = await Category.find(filter)
            .sort({ nome: 1 });

        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar categorias'
        });
    }
};

// ============================================
// 3. BUSCAR CATEGORIA POR ID
// ============================================
export const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar categoria'
        });
    }
};

// ============================================
// 4. BUSCAR CATEGORIA POR SLUG
// ============================================
export const getCategoryBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;

        const category = await Category.findOne({ slug });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar categoria'
        });
    }
};

// ============================================
// 5. ATUALIZAR CATEGORIA
// ============================================
export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        // Verifica se nome já existe em outra categoria
        if (nome) {
            const existing = await Category.findOne({
                nome,
                _id: { $ne: id }
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria com este nome já existe'
                });
            }
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { nome, descricao },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category,
            message: 'Categoria atualizada com sucesso'
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar categoria'
        });
    }
};

// ============================================
// 6. DESATIVAR CATEGORIA (SOFT DELETE)
// ============================================
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { ativo: false },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category,
            message: 'Categoria desativada com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao desativar categoria'
        });
    }
};

// ============================================
// 7. REATIVAR CATEGORIA
// ============================================
export const reactivateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { ativo: true },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: category,
            message: 'Categoria reativada com sucesso'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar categoria'
        });
    }
};

// ============================================
// 8. DELETAR CATEGORIA PERMANENTEMENTE
// ============================================
export const deleteCategoryPermanently = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Categoria deletada permanentemente'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar categoria'
        });
    }
};