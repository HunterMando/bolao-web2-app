// src/api/meio_pagamento/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { CreateMeioPagamentoDTO, UpdateMeioPagamentoDTO } from './model';

// POST /meios-pagamento
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const data: CreateMeioPagamentoDTO = req.body;

        const novoMeio = await prisma.meioPagamento.create({
            data: {
                descricao: data.descricao,
                status:    data.status !== undefined ? data.status : true,
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
        const meios = await prisma.meioPagamento.findMany();
        res.status(httpStatus.OK).json(meios);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar meios de pagamento.' });
    }
};