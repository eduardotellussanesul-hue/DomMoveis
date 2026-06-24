"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', userRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API E-commerce - DomMoveisDB',
        version: '1.0.0',
        endpoints: {
            users: {
                base: '/api/users',
                auth: '/api/auth'
            },
            categories: '/api/categories',
            products: '/api/products',
            health: '/health'
        },
        documentation: 'https://github.com/seu-usuario/dommoveis-api'
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl
    });
});
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            details: Object.values(err.errors).map((e) => e.message)
        });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} já está em uso`,
            details: {
                field,
                value: err.keyValue[field]
            }
        });
    }
    if (err.name === 'MongoNetworkError') {
        return res.status(503).json({
            success: false,
            message: 'Banco de dados indisponível',
            details: {
                error: 'Falha na conexão com o MongoDB'
            }
        });
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
app.listen(PORT, async () => {
    console.log('='.repeat(50));
    console.log('🚀 Servidor iniciado com sucesso!');
    console.log('='.repeat(50));
    console.log(`🛒 URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`👤 Usuários: http://localhost:${PORT}/api/users`);
    console.log(`🏷️ Categorias: http://localhost:${PORT}/api/categories`);
    console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
    console.log('='.repeat(50));
    await (0, database_1.connectDB)();
});
process.on('SIGINT', async () => {
    console.log('\n🛑 Servidor encerrado (SIGINT)');
    await mongoose_1.default.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Servidor encerrado (SIGTERM)');
    await mongoose_1.default.disconnect();
    process.exit(0);
});
exports.default = app;
