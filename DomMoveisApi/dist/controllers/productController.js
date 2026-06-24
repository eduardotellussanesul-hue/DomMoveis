"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.deleteProductPermanently = exports.reactivateProduct = exports.deleteProduct = exports.updateProduct = exports.getProductsByCategory = exports.getProductBySlug = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const mongoose_1 = __importDefault(require("mongoose"));
const createProduct = async (req, res) => {
    try {
        const { nome, descricao, medidas, categoria, cor, preco, precoPromocional, estoque, imagens, destaque } = req.body;
        const categoryExists = await Category_1.Category.findById(categoria);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Categoria não encontrada'
            });
        }
        const product = new Product_1.Product({
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
        await product.populate('categoria', 'nome slug');
        res.status(201).json({
            success: true,
            data: product,
            message: 'Produto criado com sucesso'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao criar produto'
        });
    }
};
exports.createProduct = createProduct;
const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, categoria, destaque, ativo, search } = req.query;
        const filter = {};
        if (categoria)
            filter.categoria = categoria;
        if (destaque === 'true')
            filter.destaque = true;
        if (ativo !== undefined)
            filter.ativo = ativo === 'true';
        if (search) {
            filter.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { descricao: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            Product_1.Product.find(filter)
                .populate('categoria', 'nome slug')
                .skip(skip)
                .limit(Number(limit))
                .sort({ dataCriacao: -1 }),
            Product_1.Product.countDocuments(filter)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao listar produtos'
        });
    }
};
exports.getAllProducts = getAllProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const product = await Product_1.Product.findById(id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produto'
        });
    }
};
exports.getProductById = getProductById;
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product_1.Product.findOne({ slug })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produto'
        });
    }
};
exports.getProductBySlug = getProductBySlug;
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'ID da categoria inválido'
            });
        }
        const products = await Product_1.Product.find({
            categoria: categoryId,
            ativo: true
        }).populate('categoria', 'nome slug');
        res.status(200).json({
            success: true,
            data: products,
            count: products.length
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao buscar produtos por categoria'
        });
    }
};
exports.getProductsByCategory = getProductsByCategory;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        if (updates.categoria) {
            const categoryExists = await Category_1.Category.findById(updates.categoria);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }
        }
        const product = await Product_1.Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('categoria', 'nome slug');
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Erro ao atualizar produto'
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const product = await Product_1.Product.findByIdAndUpdate(id, { ativo: false }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao desativar produto'
        });
    }
};
exports.deleteProduct = deleteProduct;
const reactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const product = await Product_1.Product.findByIdAndUpdate(id, { ativo: true }, { new: true }).populate('categoria', 'nome slug');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao reativar produto'
        });
    }
};
exports.reactivateProduct = reactivateProduct;
const deleteProductPermanently = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const product = await Product_1.Product.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao deletar produto'
        });
    }
};
exports.deleteProductPermanently = deleteProductPermanently;
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade } = req.body;
        if (quantidade === undefined || quantidade < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantidade deve ser um número positivo'
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID inválido'
            });
        }
        const product = await Product_1.Product.findByIdAndUpdate(id, { estoque: quantidade }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao atualizar estoque'
        });
    }
};
exports.updateStock = updateStock;
