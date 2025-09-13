import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import configRoutes from './config';
import { recepcaoRoutes } from './recepcao';
import { reportRoutes } from './reports';
import tabelasRoutes from './tabelas';
import fichasAcabamentoRoutes from './fichasAcabamento';
import visualReportsRoutes from './visualReports';
import jasperReportsRoutes from './jasperReports';
import processosRoutes from './processos';
import entregasRoutes from './entregas';
import operacoesRoutes from './operacoes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/config', configRoutes);
router.use('/recepcao', recepcaoRoutes);
router.use('/reports', reportRoutes);
router.use('/reports/jasper', jasperReportsRoutes);
router.use('/tabelas', tabelasRoutes);
router.use('/fa', fichasAcabamentoRoutes);
router.use('/processos', processosRoutes);
router.use('/entregas', entregasRoutes);
router.use('/operacoes', operacoesRoutes);
router.use('/reports/visual', visualReportsRoutes);

export default router;
