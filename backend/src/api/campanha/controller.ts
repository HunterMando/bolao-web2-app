// src/api/campanha/controller.ts
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { CreateCampanhaDTO, UpdateCampanhaDTO } from './model';

// POST /campanhas
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const { opcoes, nome, dt_inicio, dt_fim, taxa_operacional, valor_bolao, codigo_campanha, tipo_campanha_id } = req.body;

        // 1. Criamos a Campanha garantindo a conversão de tipos
        const novaCampanha = await prisma.campanha.create({
            data: {
                nome: nome,
                dt_inicio: new Date(dt_inicio), // Convertendo String para Date
                dt_fim: new Date(dt_fim),       // Convertendo String para Date
                taxa_operacional: Number(taxa_operacional),
                valor_bolao: Number(valor_bolao),
                codigo_campanha: codigo_campanha,
                tipo_campanha_id: Number(tipo_campanha_id),
                status: true // Forçando status inicial como aberta
            }
        });

        // 2. Se o Front-end enviou opções, guardamos todas associadas à nova campanha
        if (opcoes && opcoes.length > 0) {
            const opcoesData = opcoes.map((descricao: string) => ({
                descricao: descricao,
                campanha_id: novaCampanha.id,
                eh_resultado_final: false, // Ninguém vence no momento da criação
                status: true
            }));

            // Usamos createMany para inserir todas as opções de uma vez só!
            await prisma.campanhaOpcao.createMany({ // Nota: Use o nome exato do seu model (campanhaOpcao ou campanhaOpcoes)
                data: opcoesData
            });
        }

        return res.status(httpStatus.CREATED).json({ 
            mensagem: 'Campanha e opções criadas com sucesso!', 
            campanha: novaCampanha 
        });

    } catch (error) {
        // O NOSSO ESPIÃO: Imprime o erro real no terminal do Node.js!
        console.error('🔥 ERRO DO PRISMA AO CRIAR CAMPANHA:', error);
        
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            erro: 'Erro interno ao criar a campanha. Verifique o terminal do servidor.' 
        });
    }
};

// GET /campanhas
export const getAll = async (req: Request, res: Response) => {
    try {
        // O include traz os dados do Tipo de Campanha junto com a Campanha (JOIN)
        const campanhas = await prisma.campanha.findMany({
            include: {
                tipo_campanha: true
            }
        });
        res.status(httpStatus.OK).json(campanhas);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar campanhas.' });
    }
};

// PATCH /campanhas/:id/encerrar
export const encerrar = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Atualiza a campanha no banco de dados, mudando o status para false (fechada)
        const campanhaAtualizada = await prisma.campanha.update({
            where: { id: Number(id) },
            data: { status: false }
        });

        return res.status(200).json({ 
            mensagem: 'Campanha encerrada com sucesso!', 
            campanha: campanhaAtualizada 
        });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao encerrar a campanha.' });
    }
};

// POST /campanhas/:id/resultado
export const definirResultado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params; // ID da Campanha
        const { opcao_vencedora_id } = req.body; // Qual foi o palpite que venceu

        // 1. Marca como "GANHOU" todos os bilhetes que apostaram nesta opção
        await prisma.apostaBolao.updateMany({
            where: { campanha_opcao_id: Number(opcao_vencedora_id) },
            data: { status: 'GANHOU' }
        });

        // 2. Encontra todas as OUTRAS opções desta mesma campanha que não venceram
        const outrasOpcoes = await prisma.campanhaOpcao.findMany({
            where: {
                campanha_id: Number(id),
                id: { not: Number(opcao_vencedora_id) }
            }
        });
        const idsPerdedores = outrasOpcoes.map(op => op.id);

        // 3. Marca como "PERDEU" todos os bilhetes atrelados às opções perdedoras
        if (idsPerdedores.length > 0) {
            await prisma.apostaBolao.updateMany({
                where: { campanha_opcao_id: { in: idsPerdedores } },
                data: { status: 'PERDEU' }
            });
        }

        return res.status(200).json({ mensagem: 'Resultados processados e prémios calculados com sucesso!' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao processar os resultados.' });
    }
};