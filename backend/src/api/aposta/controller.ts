import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';

// GET /apostas/minhas (Calcula os ganhos)
export const listarMinhas = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;
        const usuario_id = reqAny.usuario?.id || reqAny.userId; 
        
        const apostas = await prisma.apostaBolao.findMany({
            where: { usuario_id: Number(usuario_id) },
            include: { campanha_opcao: { include: { campanha: true } } },
            orderBy: { id: 'desc' } 
        });

        const apostasComPremio = await Promise.all(apostas.map(async (aposta) => {
            let valor_premio = 0;

            if (aposta.status === 'VENCEDOR') {
                const campanhaId = aposta.campanha_opcao?.campanha_id;
                
                // Busca todas as apostas daquela campanha para calcular o rateio
                const todasApostas = await prisma.apostaBolao.findMany({
                    where: { campanha_opcao: { campanha_id: campanhaId } },
                    include: { campanha_opcao: true }
                });

                const valorBolao = Number(aposta.campanha_opcao?.campanha?.valor_bolao || 0);
                const taxa = Number(aposta.campanha_opcao?.campanha?.taxa_operacional || 0) / 100;
                
                const poteTotal = todasApostas.length * valorBolao;
                const valorTaxaAdmin = poteTotal * taxa;
                const poteLiquido = poteTotal - valorTaxaAdmin;

                const qtdGanhadores = todasApostas.filter(a => a.campanha_opcao_id === aposta.campanha_opcao_id).length;
                valor_premio = qtdGanhadores > 0 ? poteLiquido / qtdGanhadores : 0;
            }

            return { ...aposta, valor_premio };
        }));
        
        return res.status(httpStatus.OK).json(apostasComPremio);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao buscar histórico de apostas.' });
    }
};

// POST /apostas
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;

        // 1. SEGURANÇA: Autenticação
        const usuario_id = reqAny.usuario?.id || reqAny.userId || reqAny.usuarioId || reqAny.usuario_id; 

        if (!usuario_id) {
            return res.status(401).json({ erro: 'Utilizador não autenticado pelo token.' });
        }

        const { meio_pagamento_id, campanha_opcao_id, comprovante } = req.body;

        // 2. Validação da Opção e da Campanha
        const opcao = await prisma.campanhaOpcao.findUnique({ 
            where: { id: Number(campanha_opcao_id) },
            include: { campanha: true }
        });

        if (!opcao) {
            return res.status(404).json({ erro: 'Opção de palpite não encontrada.' });
        }

        // 🛡️ TRAVA 2: Validação Temporal de Última Linha na Aposta
        const dataAtual = new Date();
        const dataFimCampanha = new Date(opcao.campanha.dt_fim);

        if (opcao.campanha.status === false || dataFimCampanha <= dataAtual) {
            // Se o tempo passou, mas a campanha ainda está como aberta no BD, encerramos agora mesmo!
            if (opcao.campanha.status === true) {
                await prisma.campanha.update({
                    where: { id: opcao.campanha.id },
                    data: { status: false }
                });
            }
            return res.status(400).json({ erro: 'Tempo esgotado! Esta campanha já foi encerrada e não aceita mais apostas.' });
        }

        // 3. Gravar a aposta se tudo estiver correto
        const novaAposta = await prisma.apostaBolao.create({
            data: {
                usuario_id: Number(usuario_id),
                meio_pagamento_id: Number(meio_pagamento_id),
                campanha_opcao_id: Number(campanha_opcao_id),
                comprovante: comprovante || null,
                status: 'PENDENTE'
            }
        });

        return res.status(201).json({
            mensagem: 'Aposta realizada com sucesso!',
            aposta: novaAposta
        });

    } catch (error) {
        console.error('🔥 ERRO DO PRISMA AO CRIAR APOSTA:', error);
        return res.status(500).json({ erro: 'Erro interno ao registrar aposta.' });
    }
};

// GET /apostas
export const getAll = async (req: Request, res: Response) => {
    try {
        const apostas = await prisma.apostaBolao.findMany({
            include: {
                usuario: { select: { nome: true, email: true } },
                meio_pagamento: { select: { descricao: true } },
                campanha_opcao: { select: { descricao: true, campanha: { select: { nome: true } } } }
            }
        });
        res.status(httpStatus.OK).json(apostas);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar apostas globais.' });
    }
};