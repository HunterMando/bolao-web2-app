import { Router } from 'express';
import * as meioPagamentoController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /meios-pagamento:
 *   get:
 *     summary: Lista os meios de pagamento
 *     description: 'Retorna todas as opções de pagamento. Passe ?ativos=true para trazer apenas as que os apostadores podem usar.'
 *     tags: [Meios de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 *       401:
 *         description: 'Não autorizado. Faça login.'
 *   post:
 *     summary: Cadastra um novo meio de pagamento
 *     description: 'Adiciona uma nova forma de pagamento (ex: PIX, Cartão). Requer privilégios de Admin.'
 *     tags: [Meios de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descricao
 *             properties:
 *               descricao:
 *                 type: string
 *                 example: 'PIX'
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: 'Meio de pagamento criado com sucesso.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado. Apenas administradores.'
 */
router.get('/', autenticar, meioPagamentoController.getAll);
router.post('/', autenticar, isAdmin, meioPagamentoController.create);

/**
 * @swagger
 * /meios-pagamento/{id}:
 *   put:
 *     summary: Atualiza um meio de pagamento
 *     description: 'Modifica a descrição ou ativa/desativa a opção (Soft Delete). Requer privilégios de Admin.'
 *     tags: [Meios de Pagamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID do meio de pagamento a ser atualizado.'
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
 *               descricao:
 *                 type: string
 *                 example: 'PIX Atualizado'
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: 'Atualização bem sucedida.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado. Apenas administradores.'
 *       404:
 *         description: 'Meio de pagamento não encontrado.'
 */
router.put('/:id', autenticar, isAdmin, meioPagamentoController.update);

export default router;