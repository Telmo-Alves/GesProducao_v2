import { Router } from 'express';
import { OperacoesController } from '../controllers/operacoesController';

const router = Router();

// Note: NO authentication middleware applied to these routes
// These endpoints are for wall-mounted devices with barcode readers

// GET /api/operacoes/maquinas-status - Get current machine status
router.get('/maquinas-status', OperacoesController.getMaquinasStatus);

// POST /api/operacoes/registar-leitura - Register barcode reading
router.post('/registar-leitura', OperacoesController.registrarLeitura);

// GET /api/operacoes/test-connection - Test database connection
router.get('/test-connection', OperacoesController.testConnection);

export default router;