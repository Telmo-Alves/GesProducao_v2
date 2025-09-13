import { Router } from 'express';
import { ConfigController } from '../controllers/configController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const configController = new ConfigController();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', configController.getConfig);
router.put('/', configController.updateConfig);
router.get('/test/:database', configController.testConnection);
router.get('/test', configController.testAllConnections);
router.post('/reload', configController.reloadConfig);
router.get('/ini', configController.getRawIni);
router.put('/ini', configController.saveRawIni);

export default router;