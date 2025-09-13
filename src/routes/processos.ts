import { Router } from 'express';
import { ProcessosController } from '../controllers/processosController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/processos/ficha-entrada/:faNumero - Get ficha entrada by FA number
router.get('/ficha-entrada/:faNumero', ProcessosController.getFichaEntrada);

// GET /api/processos/ficha-processos/:faNumero - Get processes for FA number
router.get('/ficha-processos/:faNumero', ProcessosController.getFichaProcessos);

// GET /api/processos/search/processos - Search available processos
router.get('/search/processos', ProcessosController.searchProcessos);

// GET /api/processos/search/cores - Search available cores
router.get('/search/cores', ProcessosController.searchCores);

// POST /api/processos/add/:faNumero - Add new process to FA
router.post('/add/:faNumero', ProcessosController.addProcesso);

// DELETE /api/processos/remove/:faNumero/:linha - Remove process from FA
router.delete('/remove/:faNumero/:linha', ProcessosController.removeProcesso);

// DELETE /api/processos/remove-ficha/:faNumero - Remove entire FA entrada
router.delete('/remove-ficha/:faNumero', ProcessosController.removeFichaEntrada);

// GET /api/processos/ultima-fa - Get the highest FA number for user's section
router.get('/ultima-fa', ProcessosController.getUltimaFA);

export default router;