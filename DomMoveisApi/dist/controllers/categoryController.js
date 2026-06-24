"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryPermanently = exports.reactivateCategory = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = require("../models/Category");
const mongoose_1 = __importDefault(require("mongoose"));
const createCategory = async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        const existing = await Category_1.Category.findOne({ nome });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Categoria já existe'
            });
        }
        const category = new Category_1.Category({ nome, descricao });
        await category.save();
        res.status(201).json({
            success: true,
            data: category,
            message: 'Categoria criada com sucesso'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar categoria'
        });
    }
};
exports.createCategory = createCategory;
const getAllCategories = async (req, res) => {
    try {
        const { ativo } = req.query;
        const filter = {};
        if (ativo !== undefined) {
            filter.ativo = ativo === 'true';
        }
        const categories = await Category_1.Category.find(filter)
            .sort({ nome: 1 });
        res.status(200).json({
            success: true,
            data: categories,
            count: categories.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar categorias'
        });
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const category = await Category_1.Category.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar categoria'
        });
    }
};
exports.getCategoryById = getCategoryById;
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category_1.Category.findOne({ slug });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar categoria'
        });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        if (nome) {
            const existing = await Category_1.Category.findOne({
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
        const category = await Category_1.Category.findByIdAndUpdate(id, { nome, descricao }, { new: true, runValidators: true });
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar categoria'
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const category = await Category_1.Category.findByIdAndUpdate(id, { ativo: false }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao desativar categoria'
        });
    }
};
exports.deleteCategory = deleteCategory;
const reactivateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const category = await Category_1.Category.findByIdAndUpdate(id, { ativo: true }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar categoria'
        });
    }
};
exports.reactivateCategory = reactivateCategory;
const deleteCategoryPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const category = await Category_1.Category.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar categoria'
        });
    }
};
exports.deleteCategoryPermanently = deleteCategoryPermanently;
