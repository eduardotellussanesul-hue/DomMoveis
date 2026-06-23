import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Enum para os papéis do usuário
export enum RoleType {
    Usuario = 0,
    Vendedor = 1,
    Gerente = 2,
    Administrador = 3
}

// Interface do Usuário
export interface IUser extends Document {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
    role: RoleType;
    ativo: boolean;
    dataCriacao: Date;
    ultimoAcesso?: Date;
    refreshToken?: string;
    refreshTokenExpiracao?: Date;
    roleName: string;
    roleIcon: string;
    isAdmin: boolean;
    isManager: boolean;
    isSeller: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
    updateLastAccess(): Promise<void>;
}

// Funções auxiliares para os enums
function getRoleName(role: RoleType): string {
    switch (role) {
        case RoleType.Usuario: return 'Usuário';
        case RoleType.Vendedor: return 'Vendedor';
        case RoleType.Gerente: return 'Gerente';
        case RoleType.Administrador: return 'Administrador';
        default: return 'Usuário';
    }
}

function getRoleIcon(role: RoleType): string {
    switch (role) {
        case RoleType.Usuario: return '👤';
        case RoleType.Vendedor: return '🛒';
        case RoleType.Gerente: return '📊';
        case RoleType.Administrador: return '👑';
        default: return '👤';
    }
}

// Schema do Usuário
const UserSchema = new Schema<IUser>(
    {
        nome: {
            type: String,
            required: [true, 'Nome é obrigatório'],
            trim: true,
            minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
            maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
        },
        email: {
            type: String,
            required: [true, 'Email é obrigatório'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Por favor, insira um email válido'
            ]
        },
        senha: {
            type: String,
            required: [true, 'Senha é obrigatória'],
            minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
            select: false
        },
        telefone: {
            type: String,
            sparse: true,
            match: [
                /^\(\d{2}\) \d{4,5}-\d{4}$/,
                'Telefone deve estar no formato (XX) XXXXX-XXXX'
            ]
        },
        role: {
            type: Number,
            enum: Object.values(RoleType).filter(v => typeof v === 'number'),
            default: RoleType.Usuario
        },
        ativo: {
            type: Boolean,
            default: true
        },
        dataCriacao: {
            type: Date,
            default: Date.now
        },
        ultimoAcesso: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String,
            select: false
        },
        refreshTokenExpiracao: {
            type: Date,
            select: false
        }
    },
    {
        timestamps: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ============================================
// ✅ MÉTODOS DO SCHEMA
// ============================================

// Middleware: Criptografar senha antes de salvar
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('senha')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Método: Comparar senhas
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.senha);
};

// Método: Atualizar último acesso
UserSchema.methods.updateLastAccess = async function(): Promise<void> {
    this.ultimoAcesso = new Date();
    await this.save();
};

// Virtuals (propriedades calculadas)
UserSchema.virtual('roleName').get(function() {
    return getRoleName(this.role);
});

UserSchema.virtual('roleIcon').get(function() {
    return getRoleIcon(this.role);
});

UserSchema.virtual('isAdmin').get(function() {
    return this.role === RoleType.Administrador;
});

UserSchema.virtual('isManager').get(function() {
    return this.role >= RoleType.Gerente;
});

UserSchema.virtual('isSeller').get(function() {
    return this.role >= RoleType.Vendedor;
});

// Índices para consultas mais rápidas
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ ativo: 1 });
UserSchema.index({ dataCriacao: -1 });

// Exportar o modelo
export const User = mongoose.model<IUser>('User', UserSchema);