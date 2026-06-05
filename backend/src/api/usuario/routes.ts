import { Router } from 'express';
import * as usuarioController from './controller';

const router = Router();

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Autentica o utilizador
 *     description: 'Valida as credenciais (email e senha) e devolve o Token JWT para navegação segura.'
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: 'Login efetuado, retorna o token.'
 *       401:
 *         description: 'Credenciais inválidas.'
 */
router.post('/login', usuarioController.login);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os utilizadores
 *     description: 'Retorna a base de dados de apostadores e administradores cadastrados.'
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 */
router.get('/', usuarioController.getAll);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Traz dados de um utilizador específico
 *     description: 'Busca um utilizador por ID.'
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Dados do utilizador.'
 */
router.get('/:id', usuarioController.getById);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastra um novo utilizador
 *     description: 'Cria uma nova conta no sistema, encriptando a senha antes de salvar.'
 *     tags: [Usuários]
 *     responses:
 *       201:
 *         description: 'Conta criada com sucesso.'
 *       400:
 *         description: 'CPF ou E-mail já existem no sistema.'
 */
router.post('/', usuarioController.create);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza os dados do utilizador
 *     description: 'Modifica informações cadastrais como nome ou telefone.'
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Perfil atualizado com sucesso.'
 */
router.put('/:id', usuarioController.update);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove um utilizador
 *     description: 'Exclui a conta permanentemente (cuidado com as chaves estrangeiras de apostas atreladas).'
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Conta removida com sucesso.'
 */
router.delete('/:id', usuarioController.remove);

export default router;