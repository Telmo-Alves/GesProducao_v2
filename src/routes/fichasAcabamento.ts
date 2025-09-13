import { Router } from 'express';
import { FichasAcabamentoController } from '../controllers/fichasAcabamentoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new FichasAcabamentoController();

router.use(authenticateToken);

router.post('/', controller.criar);

export default router;

