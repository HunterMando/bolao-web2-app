import { Router } from 'express';
import * as campanhaOpcaoController from './controller';

const router = Router();

/**
 * @swagger
 * /campanhas-opcoes:
 *   post:
 *     summary: Cria uma nova opção de palpite
 *     description: 'Adiciona um novo resultado possível a uma campanha existente.'
 *     tags: [Opções de Campanha]
 *     responses:
 *       201:
 *         description: 'Opção criada com sucesso.'
 */
router.post('/', campanhaOpcaoController.create);

/**
 * @swagger
 * /campanhas-opcoes/campanha/{campanhaId}:
 *   get:
 *     summary: Lista as opções de uma campanha
 *     description: 'Retorna todos os palpites cadastrados para a campanha informada.'
 *     tags: [Opções de Campanha]
 *     parameters:
 *       - in: path
 *         name: campanhaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Lista de opções da campanha.'
 */
router.get('/campanha/:campanhaId', campanhaOpcaoController.getByCampanha);

/**
 * @swagger
 * /campanhas-opcoes/{id}/resultado-final:
 *   put:
 *     summary: Define uma opção específica como vencedora
 *     description: 'Marca a flag eh_resultado_final como true para a opção escolhida.'
 *     tags: [Opções de Campanha]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Opção definida como resultado final.'
 */
router.put('/:id/resultado-final', campanhaOpcaoController.definirResultadoFinal);

export default router;