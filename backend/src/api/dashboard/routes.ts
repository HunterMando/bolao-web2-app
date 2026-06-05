import { Router } from 'express';
import * as dashboardController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Retorna métricas financeiras e de uso do Admin
 *     description: 'Traz o total arrecadado, apostas recebidas e campanhas ativas exclusivas do Admin logado (Multi-tenant).'
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Estatísticas carregadas com sucesso.'
 *       401:
 *         description: 'Acesso negado. Token não encontrado.'
 */
router.get('/stats', autenticar, isAdmin, dashboardController.getStats);

export default router;