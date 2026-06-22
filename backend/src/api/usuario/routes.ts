import { Router } from 'express';
import * as usuarioController from './controller';
import { autenticar, isAdmin } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Autentica o utilizador
 *     description: 'Valida as credenciais (email e senha) e devolve o Token JWT para navegação segura.'
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 description: 'O e-mail do utilizador'
 *                 example: 'admin@email.com'
 *               senha:
 *                 type: string
 *                 description: 'A senha secreta'
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: 'Login efetuado, retorna o token.'
 *       400:
 *         description: 'Erro de validação.'
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 'Lista recuperada com sucesso.'
 *   post:
 *     summary: Cadastra um novo utilizador
 *     description: 'Cria uma nova conta no sistema, encriptando a senha antes de salvar.'
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - cpf
 *               - telefone
 *               - tipo_usuario
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 example: 'João Silva'
 *               email:
 *                 type: string
 *                 example: 'joao@email.com'
 *               cpf:
 *                 type: string
 *                 example: '12345678901'
 *               telefone:
 *                 type: string
 *                 example: '11999999999'
 *               tipo_usuario:
 *                 type: string
 *                 example: 'COMUM'
 *               senha:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       201:
 *         description: 'Conta criada com sucesso.'
 *       400:
 *         description: 'CPF ou E-mail já existem no sistema.'
 */
router.get('/', autenticar, isAdmin, usuarioController.getAll);
router.post('/', usuarioController.create);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Traz dados de um utilizador específico
 *     description: 'Busca um utilizador por ID.'
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID do utilizador.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Utilizador encontrado com sucesso.'
 *       404:
 *         description: 'Utilizador não encontrado.'
 *   put:
 *     summary: Atualiza os dados do utilizador
 *     description: 'Modifica informações cadastrais como nome ou telefone.'
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID do utilizador a ser atualizado.'
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
 *               nome:
 *                 type: string
 *                 example: 'João Atualizado'
 *               telefone:
 *                 type: string
 *                 example: '11988887777'
 *               status:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: 'Perfil atualizado com sucesso.'
 *       404:
 *         description: 'Utilizador não encontrado.'
 *   delete:
 *     summary: Remove um utilizador
 *     description: 'Exclui a conta permanentemente (cuidado com as chaves estrangeiras de apostas atreladas).'
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 'ID do utilizador a ser removido.'
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 'Utilizador removido com sucesso.'
 *       404:
 *         description: 'Utilizador não encontrado.'
 */
router.get('/:id', autenticar, usuarioController.getById);
router.put('/:id', autenticar, usuarioController.update);
router.delete('/:id', autenticar, usuarioController.remove);

export default router;