import { Router } from 'express';
import * as tipoCampanhaController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /tipos-campanha:
 *   get:
 *     summary: Lista os tipos de campanha
 *     description: 'Retorna todas as categorias disponíveis para vincular na criação de um bolão.'
 *     tags: [Tipos de Campanha]
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 *   post:
 *     summary: Cria uma categoria de campanha
 *     description: 'Cadastra um novo esporte ou categoria (exemplo: Futebol, eSports, Eleições). Requer privilégios de Admin.'
 *     tags: [Tipos de Campanha]
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
 *                 example: 'eSports'
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: 'Categoria criada com sucesso.'
 *       401:
 *         description: 'Não autorizado.'
 *       403:
 *         description: 'Acesso negado. Apenas administradores.'
 */
router.get('/', tipoCampanhaController.getAll);
router.post('/', autenticar, isAdmin, tipoCampanhaController.create);

/**
 * @swagger
 * /tipos-campanha/{id}:
 *   put:
 *     summary: Atualiza um tipo de campanha
 *     description: 'Modifica a descrição ou o status de uma categoria existente. Requer privilégios de Admin.'
 *     tags: [Tipos de Campanha]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID da categoria a ser atualizada.'
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
 *                 example: 'eSports Atualizado'
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
 *         description: 'Tipo de campanha não encontrado.'
 */
router.put('/:id', autenticar, isAdmin, tipoCampanhaController.update);

export default router;