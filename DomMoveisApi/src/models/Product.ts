import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from './Category';

export interface IProduct extends Document {
    nome: string;
    descricao: string;
    medidas: {
        altura?: number;
        largura?: number;
        profundidade?: number;
        peso?: number;
        unidadeMedida: 'cm' | 'm' | 'kg';
    };
    categoria: mongoose.Types.ObjectId | ICategory;
    cor: string;
    preco: number;
    precoPromocional?: number;
    estoque: number;
    imagens: string[];
    slug: string;
    destaque: boolean;
    ativo: boolean;
    dataCriacao: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
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
            type: Schema.Types.ObjectId,
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual: Preço formatado
ProductSchema.virtual('precoFormatado').get(function() {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(this.preco);
});

// Virtual: Nome da categoria
ProductSchema.virtual('categoriaNome').get(function() {
    return this.categoria ? (this.categoria as any).nome : null;
});

// Middleware: Gerar slug automaticamente
ProductSchema.pre<IProduct>('save', function (next) {
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

// Middleware: Validar preço promocional
ProductSchema.pre<IProduct>('validate', function (next) {
    if (this.precoPromocional && this.precoPromocional >= this.preco) {
        this.invalidate(
            'precoPromocional',
            'Preço promocional deve ser menor que o preço normal'
        );
    }
    next();
});

// Índices
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoria: 1 });
ProductSchema.index({ preco: 1 });
ProductSchema.index({ destaque: 1 });
ProductSchema.index({ ativo: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);