import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import { z } from 'zod';

// 🛡️ MOLDES ZOD
const createOpcaoSchema = z.object({
    descricao: z.string().trim().min(1, 'A descrição não pode estar vazia.'),
    campanha_id: z.coerce.number().positive(),
    status: z.boolean().optional()
});

const updateOpcaoSchema = z.object({
    descricao: z.string().trim().min(1, 'A descrição não pode estar vazia.').optional(),
    status: z.boolean().optional()
});

// POST /campanhas-opcoes
export const create = async (req: Request, res: Response): Promise<any> => {
    const validacao = createOpcaoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const data = validacao.data;
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id; // 🕵️ Extrai o ID do Admin logado pelo token

        // 🔒 BLINDAGEM DE ISOLAMENTO: Verifica se a campanha informada existe e pertence a este Admin
        const campanha = await prisma.campanha.findUnique({
            where: { id: data.campanha_id }
        });

        if (!campanha) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'A campanha informada não existe.' });
        }

        if (campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado: Você não tem permissão para adicionar opções a uma campanha que não é sua.' });
        }

        const novaOpcao = await prisma.campanhaOpcao.create({
            data: {
                descricao: data.descricao,
                campanha_id: data.campanha_id,
                status: data.status !== undefined ? data.status : true,
                eh_resultado_final: false
            }
        });

        res.status(httpStatus.CREATED).json({ 
            mensagem: 'Opção de campanha criada com sucesso!', 
            opcao: novaOpcao 
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(httpStatus.CONFLICT).json({ erro: 'Já existe uma opção com esta descrição para esta campanha.' });
        }
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao criar a opção.' });
    }
};

// GET /campanhas-opcoes/campanha/:campanhaId
export const getByCampanha = async (req: Request, res: Response): Promise<any> => {
    try {
        const { campanhaId } = req.params;
        const { ativos } = req.query;
        const reqAny = req as any;
        const usuarioLogado = reqAny.usuario; // 🕵️ Pegamos o utilizador completo do token

        const campanha = await prisma.campanha.findUnique({
            where: { id: Number(campanhaId) }
        });

        if (!campanha) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Campanha não encontrada.' });
        }

        // 🛡️ A BLINDAGEM HÍBRIDA (A Regra de Ouro)
        // Se for um ADMIN, trancamos a porta caso a campanha não seja dele.
        // Se for um utilizador COMUM, ignoramos esta trava para ele poder jogar.
        if (usuarioLogado.tipo_usuario === 'ADMIN') {
            if (campanha.usuario_id !== Number(usuarioLogado.id)) {
                return res.status(httpStatus.FORBIDDEN).json({ 
                    erro: 'Acesso negado: Você só pode visualizar as opções de palpites das suas próprias campanhas.' 
                });
            }
        }
        
        const condicao: any = { campanha_id: Number(campanhaId) };
        if (ativos === 'true') condicao.status = true;

        const opcoes = await prisma.campanhaOpcao.findMany({
            where: condicao,
            include: { campanha: { select: { nome: true } } }
        });
        
        res.status(httpStatus.OK).json(opcoes);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar opções.' });
    }
};

// PUT /campanhas-opcoes/:id (Para alterar Descrição e Status)
export const update = async (req: Request, res: Response): Promise<any> => {
    const validacao = updateOpcaoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const dadosLimpados = validacao.data;
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        if (Object.keys(dadosLimpados).length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Nenhum dado válido fornecido para atualização.' });
        }

        const opcaoExistente = await prisma.campanhaOpcao.findUnique({
            where: { id: Number(id) },
            include: { campanha: true }
        });

        if (!opcaoExistente) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Opção não encontrada.' });
        }

        // 🔒 BLINDAGEM DE ISOLAMENTO: Se a campanha da opção não for do Admin logado, barra na hora!
        if (opcaoExistente.campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado: Você não pode alterar opções de uma campanha que não é sua.' });
        }

        // 🔒 TRAVA DE TEMPO E STATUS
        const agora = new Date();
        if (opcaoExistente.campanha.status === false || agora > opcaoExistente.campanha.dt_fim) {
            return res.status(httpStatus.FORBIDDEN).json({ 
                erro: 'Operação bloqueada. Não é possível alterar opções de uma campanha que já foi encerrada.' 
            });
        }

        const opcaoAtualizada = await prisma.campanhaOpcao.update({
            where: { id: Number(id) },
            data: dadosLimpados
        });

        res.status(httpStatus.OK).json({ 
            mensagem: 'Opção de campanha updated com sucesso!', 
            opcao: opcaoAtualizada 
        });
    } catch (error: any) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao atualizar a opção.' });
    }
};

// PUT /campanhas-opcoes/:id/resultado-final
export const definirResultadoFinal = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        const opcao = await prisma.campanhaOpcao.findUnique({
            where: { id: Number(id) },
            include: { campanha: true }
        });

        if (!opcao) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'Opção não encontrada.' });
        }

        // 🔒 BLINDAGEM DE ISOLAMENTO: Só deixa definir o vencedor se for o Admin dono do bolão
        if (opcao.campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado: Você não pode definir o resultado de uma campanha que não é sua.' });
        }

        const agora = new Date();
        const dataFim = new Date(opcao.campanha.dt_fim);
        
        // Regra de tempo/status antecipado
        if (opcao.campanha.status === true && agora.getTime() <= dataFim.getTime()) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Não é possível apurar o resultado. A campanha ainda está aberta e recebendo apostas.' 
            });
        }

        // 🔒 Trava de Dupla Apuração
        const vencedorExistente = await prisma.campanhaOpcao.findFirst({
            where: {
                campanha_id: opcao.campanha_id,
                eh_resultado_final: true
            }
        });

        if (vencedorExistente) {
            return res.status(httpStatus.FORBIDDEN).json({
                erro: 'Operação bloqueada: O resultado desta campanha já foi apurado definitivamente. O vencedor não pode ser alterado.'
            });
        }

        await prisma.campanhaOpcao.update({
            where: { id: Number(id) },
            data: { eh_resultado_final: true }
        });

        res.status(httpStatus.OK).json({ 
            mensagem: `Resultado final apurado com sucesso! A opção '${opcao.descricao}' é a vencedora.` 
        });

    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao apurar resultado.' });
    }
};