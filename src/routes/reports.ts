import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const reportController = new ReportController();

router.use(authenticateToken);

// Rotas para geração de relatórios
router.get('/recepcoes/pdf', reportController.generateRecepcoesPDF);
router.get('/recepcoes/preview', reportController.previewRecepcoesPDF);

// Rotas para gestão de templates
router.get('/templates', reportController.listTemplates);
router.get('/templates/:templateId', reportController.getTemplate);
router.post('/templates', reportController.createTemplate);
router.put('/templates', reportController.saveTemplate);

export { router as reportRoutes };