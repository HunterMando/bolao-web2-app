import { Router } from 'express';
import * as apostaController from './controller';
import { autenticar } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /apostas:
 *   post:
 *     summary: Realiza uma nova aposta
 *     description: 'Cria uma aposta para o utilizador autenticado em uma opção de campanha específica.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 'Aposta realizada com sucesso.'
 *       400:
 *         description: 'Tempo esgotado ou campanha encerrada.'
 *       401:
 *         description: 'Não autorizado.'
 */
router.post('/', autenticar, apostaController.create);

/**
 * @swagger
 * /apostas:
 *   get:
 *     summary: Lista todas as apostas globais
 *     description: 'Retorna o histórico de todas as apostas registradas no sistema (Recomendado para Admin).'
 *     tags: [Apostas]
 *     responses:
 *       200:
 *         description: 'Lista de apostas recuperada com sucesso.'
 */
router.get('/', apostaController.getAll);

/**
 * @swagger
 * /apostas/minhas:
 *   get:
 *     summary: Lista as apostas do utilizador logado
 *     description: 'Retorna o histórico de apostas apenas do utilizador autenticado, calculando também os prêmios de vitórias.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Histórico de apostas do utilizador.'
 *       401:
 *         description: 'Não autorizado.'
 */
router.get('/minhas', autenticar, apostaController.listarMinhas);

export default router;