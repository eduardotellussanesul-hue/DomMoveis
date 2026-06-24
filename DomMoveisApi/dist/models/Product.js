"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    nome: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true,
        minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
        maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true,
        minlength: [10, 'Descrição deve ter no mínimo 10 caracteres'],
        maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres']
    },
    medidas: {
        altura: {
            type: Number,
            min: 0
        },
        largura: {
            type: Number,
            min: 0
        },
        profundidade: {
            type: Number,
            min: 0
        },
        peso: {
            type: Number,
            min: 0
        },
        unidadeMedida: {
            type: String,
            enum: ['cm', 'm', 'kg'],
            default: 'cm'
        }
    },
    categoria: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Categoria é obrigatória']
    },
    cor: {
        type: String,
        required: [true, 'Cor é obrigatória'],
        trim: true,
        maxlength: [30, 'Cor deve ter no máximo 30 caracteres']
    },
    preco: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    },
    precoPromocional: {
        type: Number,
        min: [0, 'Preço promocional não pode ser negativo']
    },
    estoque: {
        type: Number,
        required: [true, 'Estoque é obrigatório'],
        min: [0, 'Estoque não pode ser negativo'],
        default: 0
    },
    imagens: {
        type: [String],
        default: []
    },
    slug: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        trim: true
    },
    destaque: {
        type: Boolean,
        default: false
    },
    ativo: {
        type: Boolean,
        default: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ProductSchema.virtual('precoFormatado').get(function () {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(this.preco);
});
ProductSchema.virtual('categoriaNome').get(function () {
    return this.categoria ? this.categoria.nome : null;
});
ProductSchema.pre('save', function (next) {
    if (this.isModified('nome')) {
        this.slug = this.nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});
ProductSchema.pre('validate', function (next) {
    if (this.precoPromocional && this.precoPromocional >= this.preco) {
        this.invalidate('precoPromocional', 'Preço promocional deve ser menor que o preço normal');
    }
    next();
});
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoria: 1 });
ProductSchema.index({ preco: 1 });
ProductSchema.index({ destaque: 1 });
ProductSchema.index({ ativo: 1 });
exports.Product = mongoose_1.default.model('Product', ProductSchema);
