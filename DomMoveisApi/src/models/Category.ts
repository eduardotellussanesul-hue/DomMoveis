import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    nome: string;
    descricao?: string;
    slug: string;
    ativo: boolean;
    dataCriacao: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
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
            required: true,
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
    },
    {
        timestamps: true
    }
);

// Middleware: Gerar slug automaticamente antes de salvar
CategorySchema.pre<ICategory>('save', function (next) {
    if (this.isModified('nome')) {
        this.slug = this.nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]+/g, '-') // Substitui espaços por hífen
            .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
    }
    next();
});

// Índices
CategorySchema.index({ slug: 1 });
CategorySchema.index({ nome: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);