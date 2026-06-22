// src/api/usuario/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from './model';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

// 🛡️ O MOLDE ZOD DO CADASTRO (Criação)
const usuarioSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 letras.'),
    email: z.string().email('Formato de e-mail inválido.'),
    cpf: z.string().regex(/^\d{11}$/, 'O CPF deve conter exatamente 11 números.'),
    telefone: z.string().regex(/^\d{10,11}$/, 'O telefone deve ter apenas números.'),
    tipo_usuario: z.string(),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.')
});

// 🛡️ O MOLDE ZOD PARA ATUALIZAÇÃO (PUT)
// Usamos .optional() para que o utilizador não seja obrigado a enviar todos os campos,
// MAS, se enviar, tem que respeitar as regras (não pode ser em branco).
const updateUsuarioSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 letras.').optional(),
    telefone: z.string().regex(/^\d{10,11}$/, 'O telefone deve ter apenas números (10 ou 11 dígitos).').optional(),
    status: z.boolean().optional()
});

// 🛡️ O NOVO MOLDE ZOD EXCLUSIVO PARA LOGIN
const loginSchema = z.object({
    email: z.string().email('Formato de e-mail inválido.'),
    senha: z.string().min(1, 'A senha é obrigatória.')
});

// GET /usuarios - Listar todos os utilizadores
export const getAll = async (req: Request, res: Response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            // 👇 Veja que eu adicionei o telefone: true aqui
            select: { id: true, nome: true, email: true, cpf: true, telefone: true, status: true, tipo_usuario: true }
        });
        res.status(httpStatus.OK).json(usuarios);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar utilizadores.' });
    }
};

// GET /usuarios/:id - Buscar usuário por ID
export const getById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(id) },
            // 👇 E aqui também
            select: { id: true, nome: true, email: true, cpf: true, telefone: true, status: true, tipo_usuario: true }
        });

        if (!usuario) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Usuário não encontrado.' });
        }

        res.status(httpStatus.OK).json(usuario);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar usuário.' });
    }
};

// POST /usuarios - Criar novo usuário
export const create = async (req: Request, res: Response): Promise<any> => {
    const dadosLimpos = {
        ...req.body,
        cpf: req.body.cpf?.replace(/\D/g, '') || '',
        telefone: req.body.telefone?.replace(/\D/g, '') || ''
    };

    const validacao = usuarioSchema.safeParse(dadosLimpos);
    
    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    const dadosValidados = validacao.data;

    try {
        const senhaCriptografada = await bcrypt.hash(dadosValidados.senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: dadosValidados.nome,
                cpf: dadosValidados.cpf,
                email: dadosValidados.email,
                telefone: dadosValidados.telefone,
                tipo_usuario: dadosValidados.tipo_usuario,
                senha: senhaCriptografada,
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Utilizador criado com sucesso!', 
            id: novoUsuario.id 
        });
    } catch (error) {
        const err = error as any;
        if (err.code === 'P2002') {
            return res.status(httpStatus.CONFLICT).json({ erro: `O campo ${err.meta.target} já está em uso.` });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar utilizador.' });
    }
};

// PUT /usuarios/:id - Atualizar usuário
export const update = async (req: Request, res: Response): Promise<any> => {
    // 🛡️ 1. O Zod varre os dados antes de qualquer coisa!
    const validacao = updateUsuarioSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const dadosLimpados = validacao.data;

        // Se o utilizador tentou enviar um objeto completamente vazio (ex: {} )
        if (Object.keys(dadosLimpados).length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Nenhum dado válido fornecido para atualização.' });
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: Number(id) },
            data: dadosLimpados
        });

        res.status(httpStatus.OK).json({ mensagem: 'Usuário atualizado com sucesso!', usuarioAtualizado });
    } catch (error) {
        const err = error as any;
        if (err.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Usuário não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar usuário.' });
    }
};

// DELETE /usuarios/:id - Remover usuário
export const remove = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        await prisma.usuario.delete({
            where: { id: Number(id) }
        });

        res.status(httpStatus.OK).json({ mensagem: 'Usuário removido com sucesso!' });
    } catch (error) {
        const err = error as any;
        if (err.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Usuário não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao remover usuário.' });
    }
};

// POST /usuarios/login - Autenticação
export const login = async (req: Request, res: Response): Promise<any> => {
    // 🛡️ 1. O Zod valida os dados de entrada de forma segura
    const validacao = loginSchema.safeParse(req.body);

    if (!validacao.success) {
        // Se alguém tentar enviar um email mal formatado, rejeita antes de procurar no banco
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        // Usa os dados validados e limpos pelo Zod
        const { email, senha } = validacao.data;

        const usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });

        if (!usuario) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Credenciais inválidas.' });
        }

        // 🛡️ NOVA BLINDAGEM: Verifica se o usuário foi desativado/banido
        if (usuario.status === false) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado. Esta conta foi desativada.' });
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'E-mail ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id: usuario.id, tipo_usuario: usuario.tipo_usuario }, 
            JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        res.status(httpStatus.OK).json({
            mensagem: 'Login efetuado com sucesso!',
            token: token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                tipo_usuario: usuario.tipo_usuario
            }
        });

    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao fazer login.' });
    }
};