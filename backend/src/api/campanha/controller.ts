import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

// 🛡️ MOLDE ZOD (Criação)
const campanhaSchema = z.object({
    nome: z.string().min(3, 'O nome deve ter pelo menos 3 letras.'),
    codigo_campanha: z.string().min(3, 'O código único deve ter pelo menos 3 caracteres.'),
    tipo_campanha_id: z.coerce.number().positive('Tipo de campanha inválido.'),
    dt_inicio: z.string(),
    dt_fim: z.string(),
    taxa_operacional: z.coerce.number().min(0, 'A taxa não pode ser negativa.').max(100, 'A taxa máxima é 100%.'),
    valor_bolao: z.coerce.number().positive('O valor do bolão deve ser maior que zero.'),
    opcoes: z.array(z.string().min(1, 'As opções não podem estar vazias.')).min(2, 'Mínimo de 2 opções obrigatórias.')
}).refine(data => new Date(data.dt_fim) > new Date(data.dt_inicio), {
    message: "A data de encerramento deve ser posterior à data de início."
}).refine(data => new Date(data.dt_fim) >= new Date(), {
    message: "Não é possível criar uma campanha com data de encerramento no passado."
});

// 🛡️ MOLDE ZOD PARA APURAÇÃO
const resultadoSchema = z.object({
    opcao_vencedora_id: z.coerce.number().positive('Por favor, selecione uma opção vencedora válida.')
});

// POST /campanhas
export const create = async (req: Request, res: Response): Promise<any> => {
    const validacao = campanhaSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    const dados = validacao.data;

    try {
        const reqAny = req as any;
        const usuario_id = reqAny.usuario?.id;

        if (!usuario_id) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Sessão expirada ou Admin não encontrado.' });
        }

        const novaCampanha = await prisma.campanha.create({
            data: {
                nome: dados.nome,
                dt_inicio: new Date(dados.dt_inicio),
                dt_fim: new Date(dados.dt_fim),
                taxa_operacional: dados.taxa_operacional,
                valor_bolao: dados.valor_bolao,
                codigo_campanha: dados.codigo_campanha,
                tipo_campanha_id: dados.tipo_campanha_id,
                status: true, 
                usuario_id: Number(usuario_id)
            }
        });

        const opcoesData = dados.opcoes.map((descricao: string) => ({
            descricao: descricao,
            campanha_id: novaCampanha.id,
            eh_resultado_final: false,
            status: true
        }));
        await prisma.campanhaOpcao.createMany({ data: opcoesData });

        return res.status(httpStatus.CREATED).json({ mensagem: 'Campanha criada com sucesso!', campanha: novaCampanha });

    } catch (error) {
        const err = error as any;
        if (err.code === 'P2002' && err.meta?.target?.includes('codigo_campanha')) {
            return res.status(httpStatus.CONFLICT).json({ 
                erro: 'Este Código Único já está a ser utilizado noutra campanha. Por favor, escolha um código diferente.' 
            });
        }
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro interno no servidor.' });
    }
};

// GET /campanhas
export const getAll = async (req: Request, res: Response) => {
    try {
        const dataAtual = new Date();

        await prisma.campanha.updateMany({
            where: { status: true, dt_fim: { lt: dataAtual } },
            data: { status: false }
        });

        let adminId = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                // 🔒 Validação real do Token
                const decodedPayload: any = jwt.verify(token, JWT_SECRET);
                if (decodedPayload?.tipo_usuario === 'ADMIN') {
                    adminId = decodedPayload.id;
                }
            } catch (err) {
                // Token inválido, segue como visitante comum
            }
        }

        const whereClause = adminId ? { usuario_id: Number(adminId) } : { status: true };

        const campanhas = await prisma.campanha.findMany({
            where: whereClause,
            include: { tipo_campanha: true, opcoes: true },
            orderBy: { id: 'desc' }
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
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        const campanha = await prisma.campanha.findUnique({ 
            where: { id: Number(id) } 
        });

        if (!campanha) return res.status(httpStatus.NOT_FOUND).json({ erro: 'Campanha não encontrada.' });

        // 🔒 BLINDAGEM 1: Apenas o dono pode encerrar
        if (campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado: Esta campanha não lhe pertence.' });
        }

        // 🔒 BLINDAGEM 2: Verifica se ela já foi apurada (finalizada com vencedor)
        const jaApurada = await prisma.campanhaOpcao.findFirst({
            where: { campanha_id: campanha.id, eh_resultado_final: true }
        });

        if (jaApurada) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Operação inválida: Esta campanha já foi encerrada e finalizada com a apuração dos vencedores.' 
            });
        }

        // 🔒 BLINDAGEM 3: Verifica se ela já foi encerrada manualmente antes (fase de apuração)
        if (campanha.status === false) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Atenção: Esta campanha já se encontra encerrada e aguardando a definição do vencedor.' 
            });
        }

        // Se passou por todas as travas, significa que estava ativa (true). Pode encerrar!
        const campanhaAtualizada = await prisma.campanha.update({
            where: { id: Number(id) },
            data: { status: false }
        });

        return res.status(httpStatus.OK).json({ 
            mensagem: 'Campanha encerrada com sucesso! Agora ela está pronta para a apuração do resultado.', 
            campanha: campanhaAtualizada 
        });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao encerrar a campanha.' });
    }
};

// PATCH /campanhas/:id/resultado (Apurar Vencedor)
export const definirResultado = async (req: Request, res: Response): Promise<any> => {
    const validacao = resultadoSchema.safeParse(req.body);

    if (!validacao.success) {
        return res.status(httpStatus.BAD_REQUEST).json({ erro: validacao.error.issues[0].message });
    }

    try {
        const { id } = req.params;
        const campanhaId = Number(id);
        const { opcao_vencedora_id } = validacao.data;
        const reqAny = req as any;
        const adminId = reqAny.usuario?.id;

        const campanha = await prisma.campanha.findUnique({ where: { id: campanhaId } });
        if (!campanha) return res.status(httpStatus.NOT_FOUND).json({ erro: 'Campanha não encontrada.' });

        // 🔒 BLINDAGEM DE DONO
        if (campanha.usuario_id !== Number(adminId)) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Acesso negado: Você não pode apurar resultados de campanhas alheias.' });
        }

        // 🔒 BLINDAGEM DE VÍNCULO CRUZADO
        // Garante que a opção informada no body realmente pertence à campanha informada na URL
        const opcaoEscolhida = await prisma.campanhaOpcao.findUnique({
            where: { id: Number(opcao_vencedora_id) }
        });

        if (!opcaoEscolhida) {
            return res.status(httpStatus.NOT_FOUND).json({ erro: 'A opção vencedora informada não existe no sistema.' });
        }

        if (opcaoEscolhida.campanha_id !== campanhaId) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Inconsistência de dados: A opção que você tentou definir como vencedora não pertence a esta campanha!' 
            });
        }

        // 🔒 TRAVA DE TEMPO
        const agora = new Date();
        if (campanha.status === true && agora.getTime() <= new Date(campanha.dt_fim).getTime()) {
            return res.status(httpStatus.BAD_REQUEST).json({ erro: 'A campanha ainda está aberta. Aguarde o encerramento para apurar.' });
        }

        // 🔒 TRAVA DE DUPLICIDADE
        const jaApurada = await prisma.campanhaOpcao.findFirst({
            where: { campanha_id: campanhaId, eh_resultado_final: true }
        });

        if (jaApurada) {
            return res.status(httpStatus.FORBIDDEN).json({ erro: 'Esta campanha já foi apurada definitivamente. O resultado não pode ser alterado.' });
        }

        await prisma.$transaction(async (tx) => {
            // Aprova as apostas vencedoras
            await tx.apostaBolao.updateMany({
                where: { campanha_opcao_id: Number(opcao_vencedora_id), status: 'APROVADO' },
                data: { status: 'VENCEDOR' }
            });

            // Reprova as apostas perdedoras
            await tx.apostaBolao.updateMany({
                where: { campanha_opcao: { campanha_id: campanhaId }, campanha_opcao_id: { not: Number(opcao_vencedora_id) }, status: 'APROVADO' },
                data: { status: 'PERDEDOR' }
            });

            // Sela a opção como vencedora
            await tx.campanhaOpcao.update({
                where: { id: Number(opcao_vencedora_id) },
                data: { eh_resultado_final: true }
            });
        });

        return res.status(httpStatus.OK).json({ mensagem: 'Apuração realizada com sucesso!' });
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao processar apuração.' });
    }
};

// GET /campanhas/:id
export const getById = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const campanha = await prisma.campanha.findUnique({
            where: { id: Number(id) },
            include: { opcoes : true }
        });

        if (!campanha) return res.status(httpStatus.NOT_FOUND).json({ erro: 'Campanha não encontrada.' });

        return res.status(httpStatus.OK).json(campanha);
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro interno ao buscar detalhes da campanha.' });
    }
};