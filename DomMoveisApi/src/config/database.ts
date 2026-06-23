import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'DomMoveisDB';

export const connectDB = async (): Promise<void> => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI não definida no arquivo .env');
        }

        await mongoose.connect(MONGODB_URI, {
            dbName: DATABASE_NAME,
            retryWrites: true,
            w: 'majority'
        });

        console.log(`✅ Conectado ao MongoDB! Banco: ${DATABASE_NAME}`);
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};