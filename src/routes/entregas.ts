import { Router } from 'express';
import { EntregasController } from '../controllers/entregasController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// POST /api/entregas/registar/:faNumero - Register delivery for FA number
router.post('/registar/:faNumero', EntregasController.registarEntrega);

export default router;