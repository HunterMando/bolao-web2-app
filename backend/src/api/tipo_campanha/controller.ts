// src/api/tipo_campanha/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { z } from 'zod';

// 🛡️ MOLDES ZOD PARA TIPOS DE CAMPANHA
const createTipoSchema = z.object({
    descricao: z.string().trim().min(2, 'A descrição deve ter pelo menos 2 letras.'),
    status: z.boolean().optional()
});

const updateTipoSchema = z.object({
    descricao: z.string().trim().min(2, 'A descrição deve ter pelo menos 2 letras.').optional(),
    status: z.boolean().optional()
});

// POST /tipos-campanha
export const create = async (req: Request, res: Response): Promise<any> => {
    // 1. Zod barra descrições vazias ou muito curtas
    const validacao = createTipoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const dadosLimpados = validacao.data;

        const novoTipo = await prisma.tipoCampanha.create({
            data: {
                descricao: dadosLimpados.descricao,
                status: dadosLimpados.status !== undefined ? dadosLimpados.status : true,
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
        // 💡 O truque está aqui: Se a URL tiver ?ativos=true, filtramos. 
        // Se não tiver, trazemos todos (para o Admin poder ver e reativar se quiser).
        const { ativos } = req.query;
        const condicao = ativos === 'true' ? { status: true } : {};

        const tipos = await prisma.tipoCampanha.findMany({
            where: condicao,
            orderBy: { descricao: 'asc' }
        });
        res.status(httpStatus.OK).json(tipos);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar tipos de campanha.' });
    }
};

// PUT /tipos-campanha/:id
export const update = async (req: Request, res: Response): Promise<any> => {
    // 1. Validação Zod para a atualização
    const validacao = updateTipoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const dadosLimpados = validacao.data;

        // Evita chamadas inúteis ao banco se não houver dados
        if (Object.keys(dadosLimpados).length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Nenhum dado válido fornecido para atualização.' });
        }

        const tipoAtualizado = await prisma.tipoCampanha.update({
            where: { id: Number(id) },
            data: dadosLimpados
        });

        res.status(httpStatus.OK).json({ mensagem: 'Tipo atualizado com sucesso!', tipo: tipoAtualizado });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Tipo de campanha não encontrado.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar tipo de campanha.' });
    }
};