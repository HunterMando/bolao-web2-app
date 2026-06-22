// src/api/meio_pagamento/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { z } from 'zod';

// 🛡️ MOLDES ZOD
const createMeioSchema = z.object({
    descricao: z.string().trim().min(2, 'A descrição deve ter pelo menos 2 letras.'),
    status: z.boolean().optional()
});

const updateMeioSchema = z.object({
    descricao: z.string().trim().min(2, 'A descrição deve ter pelo menos 2 letras.').optional(),
    status: z.boolean().optional()
});

// POST /meios-pagamento
export const create = async (req: Request, res: Response): Promise<any> => {
    const validacao = createMeioSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const dados = validacao.data;

        const novoMeio = await prisma.meioPagamento.create({
            data: {
                descricao: dados.descricao,
                status: dados.status !== undefined ? dados.status : true,
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Meio de pagamento criado com sucesso!', 
            meioPagamento: novoMeio 
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar meio de pagamento.' });
    }
};

// GET /meios-pagamento
export const getAll = async (req: Request, res: Response) => {
    try {
        // 💡 O filtro inteligente: ?ativos=true
        const { ativos } = req.query;
        const condicao = ativos === 'true' ? { status: true } : {};

        const meios = await prisma.meioPagamento.findMany({
            where: condicao,
            orderBy: { descricao: 'asc' } // Ordem alfabética para facilitar o select no Front
        });
        res.status(httpStatus.OK).json(meios);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar meios de pagamento.' });
    }
};

// PUT /meios-pagamento/:id
export const update = async (req: Request, res: Response): Promise<any> => {
    const validacao = updateMeioSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const dados = validacao.data;

        if (Object.keys(dados).length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Nenhum dado válido fornecido para atualização.' });
        }

        const meioAtualizado = await prisma.meioPagamento.update({
            where: { id: Number(id) },
            data: dados
        });

        res.status(httpStatus.OK).json({ mensagem: 'Meio de pagamento atualizado com sucesso!', meioPagamento: meioAtualizado });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Meio de pagamento não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar meio de pagamento.' });
    }
};