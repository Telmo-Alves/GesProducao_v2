import { Router } from 'express';
import { TabelasController } from '../controllers/tabelasController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new TabelasController();

router.use(authenticateToken);

// Clientes
router.get('/clientes', controller.listClientes);
router.get('/clientes/:codigo', controller.getCliente);
router.post('/clientes', requireAdmin, controller.createCliente);
router.put('/clientes/:codigo', requireAdmin, controller.updateCliente);
router.delete('/clientes/:codigo', requireAdmin, controller.deleteCliente);

// Artigos
router.get('/artigos', controller.listArtigos);
router.get('/artigos/:codigo', controller.getArtigo);
router.post('/artigos', requireAdmin, controller.createArtigo);
router.put('/artigos/:codigo', requireAdmin, controller.updateArtigo);
router.delete('/artigos/:codigo', requireAdmin, controller.deleteArtigo);

// Composições
router.get('/composicoes', controller.listComposicoes);
router.get('/composicoes/:codigo', controller.getComposicao);
router.post('/composicoes', requireAdmin, controller.createComposicao);
router.put('/composicoes/:codigo', requireAdmin, controller.updateComposicao);
router.delete('/composicoes/:codigo', requireAdmin, controller.deleteComposicao);

// Unidades de Medida
router.get('/unidades', controller.listUnidades);
router.get('/unidades/:un_medida', controller.getUnidade);
router.post('/unidades', requireAdmin, controller.createUnidade);
router.put('/unidades/:un_medida', requireAdmin, controller.updateUnidade);
router.delete('/unidades/:un_medida', requireAdmin, controller.deleteUnidade);

// Secções
router.get('/seccoes', controller.listSeccoes);
router.get('/seccoes/:seccao', controller.getSeccao);
router.post('/seccoes', requireAdmin, controller.createSeccao);
router.put('/seccoes/:seccao', requireAdmin, controller.updateSeccao);
router.delete('/seccoes/:seccao', requireAdmin, controller.deleteSeccao);

export default router;
