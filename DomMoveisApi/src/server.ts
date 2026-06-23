import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. MIDDLEWARES
// ============================================
app.use(cors());                    // Permite requisições de outros domínios
app.use(express.json());            // Interpreta JSON no body
app.use(express.urlencoded({ extended: true })); // Interpreta dados de formulário

// ============================================
// 2. ROTAS DA API
// ============================================
app.use('/api', userRoutes);                    // Rotas de usuários (/api/users, /api/auth)
app.use('/api/categories', categoryRoutes);     // Rotas de categorias (/api/categories)
app.use('/api/products', productRoutes);        // Rotas de produtos (/api/products)

// ============================================
// 3. ROTA DE HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// ============================================
// 4. ROTA RAIZ
// ============================================
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

// ============================================
// 5. ROTA 404 - PÁGINA NÃO ENCONTRADA
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// ============================================
// 6. MIDDLEWARE DE ERRO GLOBAL
// ============================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Erro:', err);

    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            details: Object.values(err.errors).map((e: any) => e.message)
        });
    }

    // Erro de duplicidade (email, slug, etc)
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

    // Erro de rede do MongoDB
    if (err.name === 'MongoNetworkError') {
        return res.status(503).json({
            success: false,
            message: 'Banco de dados indisponível',
            details: {
                error: 'Falha na conexão com o MongoDB'
            }
        });
    }

    // Erro genérico
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// 7. INICIAR SERVIDOR
// ============================================
app.listen(PORT, async () => {
    console.log('=' .repeat(50));
    console.log('🚀 Servidor iniciado com sucesso!');
    console.log('=' .repeat(50));
    console.log(`🛒 URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`👤 Usuários: http://localhost:${PORT}/api/users`);
    console.log(`🏷️ Categorias: http://localhost:${PORT}/api/categories`);
    console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
    console.log('=' .repeat(50));
    
    // Conectar ao MongoDB
    await connectDB();
});

// ============================================
// 8. TRATAMENTO DE SINAIS DE ENCERRAMENTO
// ============================================
process.on('SIGINT', async () => {
    console.log('\n🛑 Servidor encerrado (SIGINT)');
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Servidor encerrado (SIGTERM)');
    await mongoose.disconnect();
    process.exit(0);
});

export default app;