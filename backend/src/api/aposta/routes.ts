import { Router } from 'express';
import * as apostaController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /apostas/pendentes:
 *   get:
 *     summary: Lista apostas pendentes (Fila de Aprovação)
 *     description: 'Retorna todas as apostas com status PENDENTE das campanhas criadas pelo Admin logado.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Lista de apostas recuperada.'
 */
router.get('/pendentes', autenticar, isAdmin, apostaController.getPendentes);

/**
 * @swagger
 * /apostas/{id}/status:
 *   patch:
 *     summary: Aprova ou Rejeita uma aposta
 *     description: 'Altera o status de PENDENTE para APROVADO ou CANCELADO. Apenas para o Admin dono do bolão.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da aposta a ser atualizada.'
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APROVADO, CANCELADO]
 *                 example: "APROVADO"
 *     responses:
 *       200:
 *         description: 'Status atualizado com sucesso.'
 *       400:
 *         description: 'Aposta já foi processada anteriormente.'
 *       403:
 *         description: 'Aposta pertence a outro Admin.'
 */
router.patch('/:id/status', autenticar, isAdmin, apostaController.atualizarStatus);

/**
 * @swagger
 * /apostas:
 *   post:
 *     summary: Realiza uma nova aposta
 *     description: 'Cria uma aposta para o utilizador autenticado.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campanha_opcao_id
 *               - meio_pagamento_id
 *             properties:
 *               campanha_opcao_id:
 *                 type: integer
 *                 example: 1
 *               meio_pagamento_id:
 *                 type: integer
 *                 example: 2
 *               comprovante:
 *                 type: string
 *                 example: "https://minha-url.com/recibo"
 *     responses:
 *       201:
 *         description: 'Aposta realizada com sucesso.'
 *       400:
 *         description: 'Campanha encerrada ou dados inválidos.'
 *   get:
 *     summary: Lista todas as apostas (Isoladas)
 *     description: 'Retorna o histórico de todas as apostas das campanhas pertencentes ao Admin logado.'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Lista de apostas recuperada com sucesso.'
 */
router.post('/', autenticar, apostaController.create);
router.get('/', autenticar, isAdmin, apostaController.getAll);

/**
 * @swagger
 * /apostas/minhas:
 *   get:
 *     summary: Lista as apostas do utilizador logado
 *     description: 'Retorna o histórico de apostas e prêmios apenas do utilizador (Apostador).'
 *     tags: [Apostas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Histórico de apostas do utilizador.'
 */
router.get('/minhas', autenticar, apostaController.listarMinhas);

export default router;