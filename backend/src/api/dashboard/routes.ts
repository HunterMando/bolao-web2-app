// src/api/dashboard/routes.ts
import { Router } from 'express';
import * as dashboardController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

// Rota protegida: apenas Admin pode acessar o dashboard
router.get('/stats', autenticar, isAdmin, dashboardController.getStats);

export default router;