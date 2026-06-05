import { Router } from 'express';
import * as meioPagamentoController from './controller';

const router = Router();

/**
 * @swagger
 * /meios-pagamento:
 *   post:
 *     summary: Cadastra um novo meio de pagamento
 *     description: 'Adiciona uma nova forma de pagamento ao sistema (exemplo: PIX, Cartão de Crédito).'
 *     tags: [Meios de Pagamento]
 *     responses:
 *       201:
 *         description: 'Meio de pagamento criado com sucesso.'
 */
router.post('/', meioPagamentoController.create);

/**
 * @swagger
 * /meios-pagamento:
 *   get:
 *     summary: Lista os meios de pagamento
 *     description: 'Retorna todas as opções de pagamento ativas disponíveis para o apostador.'
 *     tags: [Meios de Pagamento]
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 */
router.get('/', meioPagamentoController.getAll);

export default router;