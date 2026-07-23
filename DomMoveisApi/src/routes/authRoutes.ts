import { Router } from 'express';
import { login, refreshToken, createUser } from '../controllers/userController';

const router = Router();

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/register', createUser); // Cadastro público

export default router;