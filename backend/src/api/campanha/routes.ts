import { Router } from 'express';
import * as campanhaController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /campanhas:
 *   get:
 *     summary: Lista campanhas disponíveis
 *     description: 'Retorna campanhas ativas. Se for requisitado por um Admin logado, retorna o histórico completo das SUAS campanhas.'
 *     tags: [Campanhas]
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 *   post:
 *     summary: Cria uma nova campanha
 *     description: 'Cria uma campanha de apostas e as opções atreladas. Apenas Administradores.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - codigo_campanha
 *               - tipo_campanha_id
 *               - dt_inicio
 *               - dt_fim
 *               - valor_bolao
 *               - taxa_operacional
 *               - opcoes
 *             properties:
 *               nome:
 *                 type: string
 *                 example: 'Final da Champions League'
 *               codigo_campanha:
 *                 type: string
 *                 example: 'CHAMPIONS2024'
 *               tipo_campanha_id:
 *                 type: integer
 *                 example: 1
 *               dt_inicio:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T10:00:00Z'
 *               dt_fim:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-06-01T20:00:00Z'
 *               valor_bolao:
 *                 type: number
 *                 example: 50.00
 *               taxa_operacional:
 *                 type: number
 *                 example: 10
 *               opcoes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['Real Madrid', 'Borussia Dortmund']
 *     responses:
 *       201:
 *         description: 'Campanha criada com sucesso.'
 *       400:
 *         description: 'Erro de validação (Zod).'
 *       409:
 *         description: 'Código da campanha já existe.'
 */
router.get('/', campanhaController.getAll);
router.post('/', autenticar, isAdmin, campanhaController.create);

/**
 * @swagger
 * /campanhas/{id}:
 *   get:
 *     summary: Busca uma campanha por ID
 *     description: 'Traz os detalhes de uma campanha e as suas opções de aposta.'
 *     tags: [Campanhas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da campanha.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Detalhes recuperados.'
 *       404:
 *         description: 'Campanha não encontrada.'
 */
router.get('/:id', campanhaController.getById);

/**
 * @swagger
 * /campanhas/{id}/encerrar:
 *   patch:
 *     summary: Encerra uma campanha manualmente
 *     description: 'Altera o status para inativo. Apenas o dono da campanha.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da campanha a ser encerrada.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Campanha encerrada com sucesso.'
 *       403:
 *         description: 'Campanha pertence a outro administrador.'
 */
router.patch('/:id/encerrar', autenticar, isAdmin, campanhaController.encerrar);

/**
 * @swagger
 * /campanhas/{id}/resultado:
 *   patch:
 *     summary: Apura o vencedor da campanha
 *     description: 'Define a opção vencedora e paga os ganhadores. Apenas o dono da campanha.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da campanha a ser apurada.'
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opcao_vencedora_id
 *             properties:
 *               opcao_vencedora_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: 'Apuração concluída.'
 *       400:
 *         description: 'Campanha ainda está no prazo.'
 *       403:
 *         description: 'Já apurada ou pertence a outro administrador.'
 */
router.patch('/:id/resultado', autenticar, isAdmin, campanhaController.definirResultado);

export default router;