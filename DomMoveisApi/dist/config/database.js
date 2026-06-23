"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'DomMoveisDB';
const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI não definida no arquivo .env');
        }
        await mongoose_1.default.connect(MONGODB_URI, {
            dbName: DATABASE_NAME,
            retryWrites: true,
            w: 'majority'
        });
        console.log(`✅ Conectado ao MongoDB! Banco: ${DATABASE_NAME}`);
    }
    catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
