import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';
import jwt from 'jsonwebtoken';

// POST /campanhas
export const create = async (req: Request, res: Response): Promise<any> => {
    try {
        const { opcoes, nome, dt_inicio, dt_fim, taxa_operacional, valor_bolao, codigo_campanha, tipo_campanha_id } = req.body;

        const dataInicio = new Date(dt_inicio);
        const dataFim = new Date(dt_fim);
        const dataAtual = new Date();

        if (dataFim <= dataInicio) return res.status(httpStatus.BAD_REQUEST).json({ erro: 'A data de encerramento deve ser posterior à data de início.' });
        if (dataFim < dataAtual) return res.status(httpStatus.BAD_REQUEST).json({ erro: 'Não é possível criar uma campanha com data no passado.' });

        // 🔎 O NOSSO ESPIÃO MAIS PODEROSO:
        const reqAny = req as any;
        console.log("🕵️ DADOS DO USUÁRIO LOGADO:", reqAny.usuario);

        // Tenta capturar o ID de todas as formas possíveis que o token possa ter gerado
        const usuario_id = reqAny.usuario?.id || reqAny.userId || reqAny.usuario?.usuario_id || reqAny.usuarioId;

        if (!usuario_id) {
            return res.status(401).json({ erro: 'ID do Administrador não encontrado no token. Faça login novamente.' });
        }

        const novaCampanha = await prisma.campanha.create({
            data: {
                nome: nome,
                dt_inicio: dataInicio,
                dt_fim: dataFim,
                taxa_operacional: Number(taxa_operacional),
                valor_bolao: Number(valor_bolao),
                codigo_campanha: codigo_campanha,
                tipo_campanha_id: Number(tipo_campanha_id),
                status: true, 
                usuario_id: Number(usuario_id) // Agora garantimos que isto é um número
            }
        });

        if (opcoes && opcoes.length > 0) {
            const opcoesData = opcoes.map((descricao: string) => ({
                descricao: descricao,
                campanha_id: novaCampanha.id,
                eh_resultado_final: false,
                status: true
            }));
            await prisma.campanhaOpcao.createMany({ data: opcoesData });
        }

        return res.status(httpStatus.CREATED).json({ mensagem: 'Campanha criada com sucesso!', campanha: novaCampanha });

    } catch (error: any) {
        console.error('🔥 ERRO DO PRISMA AO CRIAR CAMPANHA:', error);
        
        // 🛡️ TRATAMENTO ELEGANTE: Captura o erro P2002 (Código Duplicado no Prisma)
        if (error.code === 'P2002' && error.meta?.target?.includes('codigo_campanha')) {
            return res.status(httpStatus.BAD_REQUEST).json({ 
                erro: 'Este Código Único já está a ser utilizado noutra campanha. Por favor, escolha um código diferente.' 
            });
        }

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            erro: 'Erro interno no servidor. Verifique o terminal.' 
        });
    }
};

// GET /campanhas
export const getAll = async (req: Request, res: Response) => {
    try {
        const dataAtual = new Date();

        // 1. AUTO-ENCERRAMENTO JUST-IN-TIME (JIT)
        await prisma.campanha.updateMany({
            where: {
                status: true,
                dt_fim: { lt: dataAtual }
            },
            data: { status: false }
        });

        // 2. DESCOBRIR QUEM ESTÁ A PEDIR A LISTA
        let adminId = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                // Decodificamos o token para ler o conteúdo
                const decodedPayload: any = jwt.decode(token);
                
                // Se for Admin, guardamos o ID dele
                if (decodedPayload && decodedPayload.tipo_usuario && decodedPayload.tipo_usuario.toUpperCase() === 'ADMIN') {
                    adminId = decodedPayload.id || decodedPayload.userId || decodedPayload.usuario_id || decodedPayload.usuarioId;
                }
            } catch (err) {
                console.error("⚠️ Erro ao decodificar token no GET /campanhas");
            }
        }

        // 3. O FILTRO MULTI-TENANT: 
        // Se adminId existir (for Admin), traz SÓ as campanhas dele.
        // Se for Apostador (adminId = null), traz só as ativas globais.
        const whereClause = adminId ? { usuario_id: Number(adminId) } : { status: true };

        // 4. BUSCAR NO BANCO
        const campanhas = await prisma.campanha.findMany({
            where: whereClause,
            include: { 
                tipo_campanha: true,
                opcoes: true // 👈 Necessário para a aba "Apuradas" no Front-end
            },
            orderBy: { id: 'desc' }
        });
        
        res.status(httpStatus.OK).json(campanhas);
    } catch (error) {
        // Se der Erro 500 de novo, olhe o terminal do Node.js! Esta linha vai dedurar o motivo exato.
        console.error("🔥 ERRO NO GET ALL CAMPANHAS:", error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao buscar campanhas.' });
    }
};

// PATCH /campanhas/:id/encerrar
export const encerrar = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

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

// PATCH /campanhas/:id/resultado (Apurar Vencedor com Transação)
export const definirResultado = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const campanhaId = Number(id);
        const { opcao_vencedora_id } = req.body;

        // --- VERIFICAÇÃO DE SEGURANÇA: Evita re-apuração ---
        const jaApurada = await prisma.campanhaOpcao.findFirst({
            where: { campanha_id: campanhaId, eh_resultado_final: true }
        });

        if (jaApurada) {
            return res.status(400).json({ erro: 'Esta campanha já foi apurada e o resultado não pode ser alterado.' });
        }

        await prisma.$transaction(async (tx) => {
            const campanha = await tx.campanha.findUnique({ where: { id: campanhaId } });
            if (!campanha) throw new Error('Campanha não encontrada');

            const todasApostas = await tx.apostaBolao.findMany({
                where: { campanha_opcao: { campanha_id: campanhaId } }
            });

            // Aplica Status Vencedor
            await tx.apostaBolao.updateMany({
                where: { campanha_opcao_id: Number(opcao_vencedora_id) },
                data: { status: 'VENCEDOR' }
            });

            // Aplica Status Perdedor
            await tx.apostaBolao.updateMany({
                where: { 
                    campanha_opcao: { campanha_id: campanhaId },
                    campanha_opcao_id: { not: Number(opcao_vencedora_id) } 
                },
                data: { status: 'PERDEDOR' }
            });

            // Marca a opção como resultado final
            await tx.campanhaOpcao.update({
                where: { id: Number(opcao_vencedora_id) },
                data: { eh_resultado_final: true }
            });
        });

        return res.status(200).json({ mensagem: 'Apuração realizada com sucesso!' });
    } catch (error) {
        console.error('🔥 ERRO NA APURAÇÃO:', error);
        return res.status(500).json({ erro: 'Erro ao processar apuração.' });
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

        if (!campanha) {
            return res.status(404).json({ erro: 'Campanha não encontrada.' });
        }

        return res.status(200).json(campanha);
    } catch (error) {
        console.error('🔥 ERRO AO BUSCAR CAMPANHA POR ID:', error);
        return res.status(500).json({ erro: 'Erro interno ao buscar detalhes da campanha.' });
    }
};