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
exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CategorySchema = new mongoose_1.Schema({
    nome: {
        type: String,
        required: [true, 'Nome da categoria é obrigatório'],
        trim: true,
        unique: true,
        minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
        maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
    },
    descricao: {
        type: String,
        trim: true,
        maxlength: [200, 'Descrição deve ter no máximo 200 caracteres']
    },
    slug: {
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        trim: true
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
    timestamps: true
});
CategorySchema.pre('save', function (next) {
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
CategorySchema.index({ slug: 1 });
CategorySchema.index({ nome: 1 });
exports.Category = mongoose_1.default.model('Category', CategorySchema);
