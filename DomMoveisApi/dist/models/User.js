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
exports.User = exports.RoleType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var RoleType;
(function (RoleType) {
    RoleType[RoleType["Usuario"] = 0] = "Usuario";
    RoleType[RoleType["Vendedor"] = 1] = "Vendedor";
    RoleType[RoleType["Gerente"] = 2] = "Gerente";
    RoleType[RoleType["Administrador"] = 3] = "Administrador";
})(RoleType || (exports.RoleType = RoleType = {}));
const UserSchema = new mongoose_1.Schema({
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
}, {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.User = mongoose_1.default.model('User', UserSchema);
