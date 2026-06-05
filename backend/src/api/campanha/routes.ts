import { Router } from 'express';
import * as campanhaController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /campanhas:
 *   post:
 *     summary: Cria uma nova campanha
 *     description: 'Cria uma campanha de apostas e suas opções. Requer token de Administrador.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 'Campanha criada com sucesso.'
 *       400:
 *         description: 'Erro de validação de datas ou código duplicado.'
 */
router.post('/', autenticar, isAdmin, campanhaController.create);

/**
 * @swagger
 * /campanhas:
 *   get:
 *     summary: Lista campanhas disponíveis
 *     description: 'Retorna campanhas ativas. Se for requisitado por um Admin, retorna o histórico completo (ativas e encerradas) isolado por inquilino.'
 *     tags: [Campanhas]
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 */
router.get('/', campanhaController.getAll);

/**
 * @swagger
 * /campanhas/{id}/encerrar:
 *   patch:
 *     summary: Encerra uma campanha manualmente
 *     description: 'Muda o status da campanha para fechada. Requer privilégios de Admin.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Campanha encerrada com sucesso.'
 */
router.patch('/:id/encerrar', autenticar, isAdmin, campanhaController.encerrar);

/**
 * @swagger
 * /campanhas/{id}/resultado:
 *   post:
 *     summary: Define o resultado da campanha (Via POST)
 *     description: 'Apura os ganhadores e distribui status de vencedor/perdedor.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Apuração realizada com sucesso.'
 */
router.post('/:id/resultado', autenticar, isAdmin, campanhaController.definirResultado);

/**
 * @swagger
 * /campanhas/{id}/resultado:
 *   patch:
 *     summary: Define o resultado da campanha (Via PATCH)
 *     description: 'Rota alternativa para apuração de ganhadores.'
 *     tags: [Campanhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Apuração realizada com sucesso.'
 */
router.patch('/:id/resultado', autenticar, campanhaController.definirResultado);

/**
 * @swagger
 * /campanhas/{id}:
 *   get:
 *     summary: Busca uma campanha por ID
 *     description: 'Traz os detalhes de uma campanha específica e as suas opções de aposta.'
 *     tags: [Campanhas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Detalhes da campanha.'
 *       404:
 *         description: 'Campanha não encontrada.'
 */
router.get('/:id', campanhaController.getById);

export default router;