import { Router } from 'express';
import { RecepcaoController } from '../controllers/recepcaoController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const recepcaoController = new RecepcaoController();

router.use(authenticateToken);

router.post('/', recepcaoController.createRecepcao);
router.get('/', recepcaoController.getAllRecepcoes);
router.get('/:seccao/:data/:linha', recepcaoController.getRecepcaoById);
router.put('/:seccao/:data/:linha', recepcaoController.updateRecepcao);
router.delete('/:seccao/:data/:linha', recepcaoController.deleteRecepcao);
router.post('/:seccao/:data/:linha/fechar', recepcaoController.fecharRecepcao);

router.get('/lookup/clientes', recepcaoController.getClientes);
router.get('/lookup/artigos', recepcaoController.getArtigos);
router.get('/lookup/composicoes', recepcaoController.getComposicoes);

export { router as recepcaoRoutes };