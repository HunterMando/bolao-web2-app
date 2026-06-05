import { Router } from 'express';
import * as tipoCampanhaController from './controller';

const router = Router();

/**
 * @swagger
 * /tipos-campanha:
 *   post:
 *     summary: Cria uma categoria de campanha
 *     description: 'Cadastra um novo esporte ou categoria (exemplo: Futebol, eSports, Eleições).'
 *     tags: [Tipos de Campanha]
 *     responses:
 *       201:
 *         description: 'Categoria criada com sucesso.'
 */
router.post('/', tipoCampanhaController.create);

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
 */
router.get('/', tipoCampanhaController.getAll);

/**
 * @swagger
 * /tipos-campanha/{id}:
 *   put:
 *     summary: Atualiza um tipo de campanha
 *     description: 'Modifica a descrição ou o status de uma categoria existente.'
 *     tags: [Tipos de Campanha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Atualização bem sucedida.'
 */
router.put('/:id', tipoCampanhaController.update);

export default router;