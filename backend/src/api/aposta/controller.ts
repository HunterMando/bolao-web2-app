// src/api/aposta/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { CreateApostaDTO } from './model';

// POST /apostas
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        // SEGURANÇA MÁXIMA: O ID vem do crachá (Token JWT), não do formulário!
        const usuario_id = (req as any).usuario.id; 
        
        const { meio_pagamento_id, campanha_opcao_id, comprovante } = req.body;

        // 1. Validação de Regra de Negócio: A campanha associada a esta opção está aberta?
        const opcao = await prisma.campanhaOpcao.findUnique({ // <-- "campanhaOpcao" no singular
            where: { id: Number(campanha_opcao_id) },
            include: { campanha: true }
        });

        if (!opcao) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Opção de palpite não encontrada.' });
        }

        if (opcao.campanha.status === false) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Esta campanha já foi encerrada e não aceita novas apostas.' });
        }

        // 2. Gravar a aposta no banco[cite: 2]
        const novaAposta = await prisma.apostaBolao.create({
            data: {
                usuario_id: usuario_id,
                meio_pagamento_id: Number(meio_pagamento_id),
                campanha_opcao_id: Number(campanha_opcao_id),
                comprovante: comprovante || null, // Comprovante é opcional
                status: 'PENDENTE' // Status inicial padrão
            }
        });

        return res.status(httpStatus.CREATED).json({
            mensagem: 'Aposta realizada com sucesso!',
            aposta: novaAposta
        });

    } catch (error) {
        console.error(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro interno ao registrar aposta.' });
    }
};

// GET /apostas
export const getAll = async (req: Request, res: Response) => {
    try {
        // Trazemos as apostas com os dados do Utilizador e da Opção para mostrar no ecrã (Front-end)
        const apostas = await prisma.apostaBolao.findMany({
            include: {
                usuario: { select: { nome: true, email: true } },
                meio_pagamento: { select: { descricao: true } },
                campanha_opcao: { select: { descricao: true, campanha: { select: { nome: true } } } }
            }
        });
        res.status(httpStatus.OK).json(apostas);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar apostas.' });
    }
};

// GET /apostas/minhas (Função para listar as apostas apenas do utilizador logado)
export const listarMinhas = async (req: Request, res: Response): Promise<any> => {
    try {
        // Usamos (req as any) para o TypeScript não bloquear a compilação
        const usuario_id = (req as any).usuario.id; 
        
        // Corrigido para usar apostaBolao em vez de aposta
        const apostas = await prisma.apostaBolao.findMany({
            where: { usuario_id: usuario_id },
            include: {
                campanha_opcao: {
                    include: {
                        campanha: true 
                    }
                },
                meio_pagamento: true
            },
            orderBy: { id: 'desc' } 
        });
        
        return res.status(httpStatus.OK).json(apostas);
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar o histórico de apostas.' });
    }
};