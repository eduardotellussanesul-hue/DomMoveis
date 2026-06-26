import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import imageRoutes from './routes/imageRoutes';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ============================================
// 1. MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 2. ROTAS DA API
// ============================================
app.use('/api', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/images', imageRoutes);  // ✅ CORRETO

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
            images: '/api/images',
            health: '/health'
        }
    });
});

// ============================================
// 5. ROTA 404
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

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Erro de validação',
            details: Object.values(err.errors).map((e: any) => e.message)
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
            message: 'Banco de dados indisponível'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// 7. INICIAR SERVIDOR
// ============================================

app.listen(PORT,'0.0.0.0', async () => {
    console.log('=' .repeat(50));
    console.log('🚀 Servidor iniciado com sucesso!');
    console.log('=' .repeat(50));
    console.log(`🛒 URL: http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`👤 Usuários: http://localhost:${PORT}/api/users`);
    console.log(`🏷️ Categorias: http://localhost:${PORT}/api/categories`);
    console.log(`📦 Produtos: http://localhost:${PORT}/api/products`);
    console.log(`🖼️ Imagens: http://localhost:${PORT}/api/images`);
    console.log('=' .repeat(50));
    console.log('📌 Rotas de Imagens:');
    console.log('   POST   /api/images/upload              - Upload de uma imagem');
    console.log('   POST   /api/images/upload-multiple     - Upload de múltiplas imagens');
    console.log('   GET    /api/images/:publicId           - Buscar imagem por ID');
    console.log('   GET    /api/images/list/:folder        - Listar imagens de uma pasta');
    console.log('   GET    /api/images/tag/:tag            - Buscar imagens por tag');
    console.log('   DELETE /api/images/:publicId           - Deletar imagem');
    console.log('   POST   /api/images/delete-multiple     - Deletar múltiplas imagens');
    console.log('   PUT    /api/images/:publicId           - Atualizar transformações');
    console.log('=' .repeat(50));

    await connectDB();
});

// ============================================
// 8. TRATAMENTO DE SINAIS
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