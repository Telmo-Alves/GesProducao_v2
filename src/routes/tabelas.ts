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

// Auxiliares
router.get('/auxiliares', controller.listAuxiliares);
router.get('/auxiliares/:auxiliar', controller.getAuxiliar);
router.post('/auxiliares', requireAdmin, controller.createAuxiliar);
router.put('/auxiliares/:auxiliar', requireAdmin, controller.updateAuxiliar);
router.delete('/auxiliares/:auxiliar', requireAdmin, controller.deleteAuxiliar);

// Corantes
router.get('/corantes', controller.listCorantes);
router.get('/corantes/:corante', controller.getCorante);
router.post('/corantes', requireAdmin, controller.createCorante);
router.put('/corantes/:corante', requireAdmin, controller.updateCorante);
router.delete('/corantes/:corante', requireAdmin, controller.deleteCorante);

// Cores
router.get('/cores', controller.listCores);
router.get('/cores/:id', controller.getCor);
router.post('/cores', requireAdmin, controller.createCor);
router.put('/cores/:id', requireAdmin, controller.updateCor);
router.delete('/cores/:id', requireAdmin, controller.deleteCor);

// Desenhos
router.get('/desenhos', controller.listDesenhos);
router.get('/desenhos/:desenho', controller.getDesenho);
router.post('/desenhos', requireAdmin, controller.createDesenho);
router.put('/desenhos/:desenho', requireAdmin, controller.updateDesenho);
router.delete('/desenhos/:desenho', requireAdmin, controller.deleteDesenho);

// Estados
router.get('/estados', controller.listEstados);
router.get('/estados/:id', controller.getEstado);
router.post('/estados', requireAdmin, controller.createEstado);
router.put('/estados/:id', requireAdmin, controller.updateEstado);
router.delete('/estados/:id', requireAdmin, controller.deleteEstado);

// Maquinas
router.get('/maquinas', controller.listMaquinas);
router.get('/maquinas/:maquina', controller.getMaquina);
router.post('/maquinas', requireAdmin, controller.createMaquina);
router.put('/maquinas/:maquina', requireAdmin, controller.updateMaquina);
router.delete('/maquinas/:maquina', requireAdmin, controller.deleteMaquina);

// Operacoes
router.get('/operacoes', controller.listOperacoes);
router.get('/operacoes/:operacao', controller.getOperacao);
router.post('/operacoes', requireAdmin, controller.createOperacao);
router.put('/operacoes/:operacao', requireAdmin, controller.updateOperacao);
router.delete('/operacoes/:operacao', requireAdmin, controller.deleteOperacao);

// Processos
router.get('/processos', controller.listProcessos);
router.get('/processos/:id', controller.getProcesso);
router.post('/processos', requireAdmin, controller.createProcesso);
router.put('/processos/:id', requireAdmin, controller.updateProcesso);
router.delete('/processos/:id', requireAdmin, controller.deleteProcesso);

// Terminais
router.get('/terminais', controller.listTerminais);
router.get('/terminais/:terminal', controller.getTerminal);
router.post('/terminais', requireAdmin, controller.createTerminal);
router.put('/terminais/:terminal', requireAdmin, controller.updateTerminal);
router.delete('/terminais/:terminal', requireAdmin, controller.deleteTerminal);

// Utilizadores
router.get('/utilizadores-sis', controller.listUtilizadores);
router.get('/utilizadores-sis/:utilizador', controller.getUtilizador);
router.post('/utilizadores-sis', requireAdmin, controller.createUtilizador);
router.put('/utilizadores-sis/:utilizador', requireAdmin, controller.updateUtilizador);
router.delete('/utilizadores-sis/:utilizador', requireAdmin, controller.deleteUtilizador);

export default router;
