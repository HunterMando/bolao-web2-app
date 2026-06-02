// src/api/tipo_campanha/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { CreateTipoCampanhaDTO, UpdateTipoCampanhaDTO } from './model';

// POST /tipos-campanha
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const data: CreateTipoCampanhaDTO = req.body;

        const novoTipo = await prisma.tipoCampanha.create({
            data: {
                descricao: data.descricao,
                status: data.status !== undefined ? data.status : true,
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Tipo de campanha criado com sucesso!', 
            tipo: novoTipo 
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar tipo de campanha.' });
    }
};

// GET /tipos-campanha
export const getAll = async (req: Request, res: Response) => {
    try {
        const tipos = await prisma.tipoCampanha.findMany();
        res.status(httpStatus.OK).json(tipos);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar tipos de campanha.' });
    }
};

// PUT /tipos-campanha/:id
export const update = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const data: UpdateTipoCampanhaDTO = req.body;

        const tipoAtualizado = await prisma.tipoCampanha.update({
            where: { id: Number(id) },
            data
        });

        res.status(httpStatus.OK).json({ mensagem: 'Tipo atualizado!', tipo: tipoAtualizado });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Tipo de campanha não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar tipo de campanha.' });
    }
};