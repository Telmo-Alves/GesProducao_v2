import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import configRoutes from './config';
import { recepcaoRoutes } from './recepcao';
import { reportRoutes } from './reports';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/config', configRoutes);
router.use('/recepcao', recepcaoRoutes);
router.use('/reports', reportRoutes);

export default router;