import { Router } from 'express';
import * as campanhaOpcaoController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /campanhas-opcoes:
 *   post:
 *     summary: Cria uma nova opção de palpite
 *     description: 'Adiciona um novo resultado possível a uma campanha existente. Apenas Administradores.'
 *     tags: [Opções de Campanha]
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
 *               - campanha_id
 *             properties:
 *               descricao:
 *                 type: string
 *                 example: 'Empate'
 *               campanha_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: 'Opção criada com sucesso.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado.'
 */
router.post('/', autenticar, isAdmin, campanhaOpcaoController.create);

/**
 * @swagger
 * /campanhas-opcoes/campanha/{campanhaId}:
 *   get:
 *     summary: Lista as opções de uma campanha
 *     description: 'Retorna todos os palpites. Use ?ativos=true para listar apenas os válidos para aposta.'
 *     tags: [Opções de Campanha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campanhaId
 *         required: true
 *         description: 'ID da campanha.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Lista de opções da campanha.'
 *       401:
 *         description: 'Não autorizado.'
 */
router.get('/campanha/:campanhaId', autenticar, campanhaOpcaoController.getByCampanha);

/**
 * @swagger
 * /campanhas-opcoes/{id}:
 *   put:
 *     summary: Atualiza uma opção de campanha
 *     description: 'Permite alterar a descrição ou desativar/ativar (status) a opção. Apenas Administradores.'
 *     tags: [Opções de Campanha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da opção de campanha a ser alterada.'
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
 *                 example: 'Vitória do Time A Alterada'
 *               status:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: 'Opção atualizada com sucesso.'
 *       400:
 *         description: 'Erro de validação.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado.'
 *       404:
 *         description: 'Opção não encontrada.'
 */
router.put('/:id', autenticar, isAdmin, campanhaOpcaoController.update);

/**
 * @swagger
 * /campanhas-opcoes/{id}/resultado-final:
 *   put:
 *     summary: Define uma opção específica como vencedora
 *     description: 'Marca a flag eh_resultado_final como true e falseia as restantes (Transação). Apenas Admin.'
 *     tags: [Opções de Campanha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da opção a ser definida como resultado final.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Opção definida como resultado final.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado.'
 */
router.put('/:id/resultado-final', autenticar, isAdmin, campanhaOpcaoController.definirResultadoFinal);

export default router;