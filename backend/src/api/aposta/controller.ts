import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { z } from 'zod';

const apostaSchema = z.object({
    campanha_opcao_id: z.coerce.number().positive('Por favor, selecione um palpite válido.'),
    meio_pagamento_id: z.coerce.number().positive('Por favor, selecione uma forma de pagamento.'),
    comprovante: z.union([
        z.string().url('O link do comprovante deve ser uma URL válida (ex: https://...).'),
        z.string().length(0)
    ]).optional()
});

const atualizarStatusSchema = z.object({
    status: z.enum(['APROVADO', 'CANCELADO'], {
        message: 'Ação inválida. O status só pode ser APROVADO ou CANCELADO.'
    })
});

// GET /apostas/minhas (🔒 BLINDADO E SEM CRASHES)
export const listarMinhas = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;
        const usuario_id = reqAny.usuario?.id; // Pega o ID de forma segura do token

        if (!usuario_id) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Utilizador não autenticado.' });
        }

        const apostas = await prisma.apostaBolao.findMany({
            where: { usuario_id: Number(usuario_id) },
            include: { 
                campanha_opcao: { include: { campanha: true } },
                meio_pagamento: true // 💡 Adicionámos para mostrar no extrato do utilizador
            },
            orderBy: { id: 'desc' }
        });

        const apostasComPremio = await Promise.all(apostas.map(async (aposta) => {
            let valor_premio = 0;
            const campanhaId = aposta.campanha_opcao?.campanha_id;

            // 🛠️ CORREÇÃO: Previne o crash garantindo que campanhaId existe
            if (aposta.status === 'VENCEDOR' && campanhaId) {
                const todasApostas = await prisma.apostaBolao.findMany({
                    where: {
                        campanha_opcao: { campanha_id: campanhaId },
                        status: { in: ['VENCEDOR', 'PERDEDOR'] } // 🛡️ Só conta quem realmente teve a aposta validada para o pote
                    }
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
        console.error("Erro no listarMinhas:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar o seu histórico de apostas.' });
    }
};

// POST /apostas
export const create = async (req: Request, res: Response): Promise<any> => {
    const validacao = apostaSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    const dados = validacao.data;

    try {
        const reqAny = req as any;
        const usuarioLogado = reqAny.usuario; // Pegamos o objeto completo do token

        if (!usuarioLogado || !usuarioLogado.id) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Utilizador não autenticado.' });
        }

        const opcao = await prisma.campanhaOpcao.findUnique({
            where: { id: Number(dados.campanha_opcao_id) },
            include: { campanha: true }
        });

        if (!opcao || !opcao.campanha) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Palpite ou Campanha não encontrada.' });
        }

        // 🛡️ NOVA BLINDAGEM HÍBRIDA: Admin não pode criar aposta em campanha de outro Admin
        if (usuarioLogado.tipo_usuario === 'ADMIN') {
            if (opcao.campanha.usuario_id !== Number(usuarioLogado.id)) {
                return res.status(httpStatus.FORBIDDEN).json({ 
                    erro: 'Acesso negado: Como Administrador, você não pode criar apostas em uma campanha que pertence a outro Administrador.' 
                });
            }
        }

        if (opcao.campanha.status === false || opcao.campanha.dt_fim < new Date()) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Esta campanha já encerrou. Não são permitidas novas apostas.' });
        }

        const novaAposta = await prisma.apostaBolao.create({
            data: {
                usuario_id: Number(usuarioLogado.id),
                campanha_opcao_id: Number(dados.campanha_opcao_id),
                meio_pagamento_id: Number(dados.meio_pagamento_id),
                comprovante: dados.comprovante || null,
                status: 'PENDENTE'
            }
        });

        res.status(httpStatus.CREATED).json({ mensagem: 'Aposta registada com sucesso!', aposta: novaAposta });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao registar aposta.' });
    }
};

// GET /apostas (🔒 BLINDADO: Apenas Admin, e apenas as apostas dos SEUS bolões)
export const getAll = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        const apostas = await prisma.apostaBolao.findMany({
            where: {
                campanha_opcao: {
                    campanha: { usuario_id: Number(adminId) }
                }
            },
            include: {
                usuario: { select: { nome: true, email: true } },
                meio_pagamento: { select: { descricao: true } },
                campanha_opcao: { select: { descricao: true, campanha: { select: { nome: true } } } }
            },
            orderBy: { id: 'desc' }
        });
        return res.status(httpStatus.OK).json(apostas);
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar apostas globais.' });
    }
};

// GET /apostas/pendentes
export const getPendentes = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id || reqAny.userId;

        const apostas = await prisma.apostaBolao.findMany({
            where: {
                status: 'PENDENTE',
                campanha_opcao: {
                    campanha: { usuario_id: Number(adminId) } 
                }
            },
            include: {
                usuario: { select: { nome: true, email: true, telefone: true } },
                meio_pagamento: { select: { descricao: true } },
                campanha_opcao: {
                    select: {
                        descricao: true,
                        campanha: { select: { nome: true, valor_bolao: true } }
                    }
                }
            },
            orderBy: { dt_criacao: 'asc' }
        });

        return res.status(200).json(apostas);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro ao buscar apostas pendentes.' });
    }
};

// PATCH /apostas/:id/status (Aprovar ou Rejeitar)
export const atualizarStatus = async (req: Request, res: Response): Promise<any> => {
    const validacao = atualizarStatusSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const { status } = validacao.data;
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        const aposta = await prisma.apostaBolao.findUnique({
            where: { id: Number(id) },
            include: { campanha_opcao: { include: { campanha: true } } }
        });

        if (!aposta) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Aposta não encontrada.' });
        }

        // 🛡️ BLINDAGEM MULTI-TENANT: Mensagem ajustada para disparo exato
        if (aposta.campanha_opcao.campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ 
                erro: 'Acesso negado: Você não pode aprovar ou rejeitar uma aposta de uma campanha que pertence a outro Administrador.' 
            });
        }

        // 🔒 Regra de Transição de Estado
        if (aposta.status !== 'PENDENTE') {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: `Operação inválida. Esta aposta já foi processada e encontra-se com o status: ${aposta.status}.` 
            });
        }

        const apostaAtualizada = await prisma.apostaBolao.update({
            where: { id: Number(id) },
            data: { status }
        });

        return res.status(httpStatus.OK).json({ mensagem: `Status da aposta atualizado para ${status}!`, aposta: apostaAtualizada });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar status.' });
    }
};