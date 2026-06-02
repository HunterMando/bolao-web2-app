// src/api/usuario/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from './model';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';


// GET /usuarios - Listar todos os utilizadores
export const getAll = async (req: Request, res: Response) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: { id: true, nome: true, email: true, cpf: true, status: true, tipo_usuario: true }
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
            select: { id: true, nome: true, email: true, cpf: true, status: true, tipo_usuario: true }
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
    try {
        const data: CreateUsuarioDTO = req.body;

        // 1. Antes de salvar, vamos criptografar (hashear) a senha!
        // O número '10' é o "salt", que define a complexidade da criptografia
        const senhaCriptografada = await bcrypt.hash(data.senha, 10);

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: data.nome,
                cpf: data.cpf,
                email: data.email,
                telefone: data.telefone,
                tipo_usuario: data.tipo_usuario,
                senha: senhaCriptografada, // <-- Guardamos a senha protegida!
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Utilizador criado com sucesso!', 
            id: novoUsuario.id 
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(httpStatus.CONFLICT).json({ erro: `O campo ${error.meta.target} já está em uso.` });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar utilizador.' });
    }
};

// PUT /usuarios/:id - Atualizar usuário
export const update = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const data: UpdateUsuarioDTO = req.body;

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: Number(id) },
            data: data
        });

        res.status(httpStatus.OK).json({ mensagem: 'Usuário atualizado!', usuarioAtualizado });
    } catch (error: any) {
        // P2025 significa que o registro não foi encontrado no Prisma
        if (error.code === 'P2025') {
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
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Usuário não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao remover usuário.' });
    }
};

// POST /usuarios/login - Autenticação
export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, senha } = req.body;

        // 1. Procurar o utilizador pelo e-mail
        const usuario = await prisma.usuario.findUnique({
            where: { email: email }
        });

        if (!usuario) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'E-mail ou senha inválidos.' });
        }

        // 2. Verificar se a senha digitada bate certo com a senha criptografada na base de dados
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'E-mail ou senha inválidos.' });
        }

        // 3. Gerar o Crachá Digital (JWT)
        // Guardamos dentro do token o ID e o TIPO (COMUM ou ADMIN)
        const token = jwt.sign(
            { id: usuario.id, tipo_usuario: usuario.tipo_usuario }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // O token expira num dia
        );

        // Devolvemos o token e os dados básicos do utilizador (nunca a senha!)
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