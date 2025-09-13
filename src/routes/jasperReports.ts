import { Router } from 'express';
import { JasperReportController } from '../controllers/jasperReportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new JasperReportController();

router.use(authenticateToken);

// JasperReports-backed endpoints
router.get('/recepcoes/pdf', controller.generateRecepcoesPDF);
router.get('/fa/:seccao/:numero', controller.generateFAPDF);

export default router;
