// src/api/campanha_opcao/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { CreateCampanhaOpcaoDTO } from './model';

// POST /campanhas-opcoes
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const data: CreateCampanhaOpcaoDTO = req.body;

        const novaOpcao = await prisma.campanhaOpcao.create({
            data: {
                descricao:          data.descricao,
                campanha_id:        data.campanha_id,
                status:             data.status !== undefined ? data.status : true,
                eh_resultado_final: false // REGRA DE NEGÓCIO: Nasce sempre como falso!
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Opção de campanha criada com sucesso!', 
            opcao: novaOpcao 
        });

    } catch (error: any) {
        // P2002: Violação do índice único composto (campanha_id + descricao)
        if (error.code === 'P2002') {
            return res.status(httpStatus.CONFLICT).json({ 
                erro: 'Já existe uma opção com esta descrição para esta campanha.' 
            });
        }
        // P2003: A campanha informada não existe
        if (error.code === 'P2003') {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'A campanha informada não existe.' 
            });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar a opção.' });
    }
};

// GET /campanhas-opcoes/campanha/:campanhaId
// Uma rota útil para buscar todas as opções de UMA campanha específica
export const getByCampanha = async (req: Request, res: Response): Promise<any> => {
    try {
        const { campanhaId } = req.params;
        
        const opcoes = await prisma.campanhaOpcao.findMany({
            where: { campanha_id: Number(campanhaId) }
        });
        
        res.status(httpStatus.OK).json(opcoes);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar opções.' });
    }
};

// PUT /campanhas-opcoes/:id/resultado-final
export const definirResultadoFinal = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // 1. Buscar a opção e incluir os dados da campanha associada
        const opcao = await prisma.campanhaOpcao.findUnique({
            where: { id: Number(id) },
            include: { campanha: true }
        });

        if (!opcao) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Opção não encontrada.' });
        }

        // 2. REGRA DE NEGÓCIO: A campanha precisa estar encerrada (Data final expirada ou status inativo)
        const agora = new Date();
        if (opcao.campanha.status === true && agora <= opcao.campanha.dt_fim) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Não é possível apurar o resultado. A campanha ainda está aberta.' 
            });
        }

        // 3. REGRA DE NEGÓCIO: Atualização em Bloco usando Transações
        // Garantimos que TODAS as opções desta campanha ficam a 'false' e só a escolhida fica a 'true'.
        await prisma.$transaction([
            prisma.campanhaOpcao.updateMany({
                where: { campanha_id: opcao.campanha_id },
                data: { eh_resultado_final: false }
            }),
            prisma.campanhaOpcao.update({
                where: { id: Number(id) },
                data: { eh_resultado_final: true }
            })
        ]);

        res.status(httpStatus.OK).json({ 
            mensagem: `Resultado final apurado com sucesso! A opção '${opcao.descricao}' é a vencedora.` 
        });

    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao apurar resultado.' });
    }
};