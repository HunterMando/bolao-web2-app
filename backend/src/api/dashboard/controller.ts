import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../prisma';

export const getStats = async (req: Request, res: Response): Promise<any> => {
    try {
        const reqAny = req as any;
        
        // 1. Pegamos o ID do Admin logado
        const adminId = reqAny.usuario?.id || reqAny.userId || reqAny.usuario?.usuario_id;

        if (!adminId) {
            return res.status(httpStatus.UNAUTHORIZED).json({ erro: 'Acesso negado. Token não encontrado.' });
        }

        // 2. Conta campanhas criadas SÓ POR ESTE ADMIN
        const totalCampanhas = await prisma.campanha.count({
            where: { usuario_id: Number(adminId) }
        });

        // 3. Conta apostas feitas SÓ NAS CAMPANHAS DESTE ADMIN
        const apostas = await prisma.apostaBolao.findMany({
            where: {
                campanha_opcao: {
                    campanha: {
                        usuario_id: Number(adminId) // 👈 A MÁGICA DO ISOLAMENTO AQUI
                    }
                }
            },
            include: {
                campanha_opcao: { include: { campanha: true } }
            }
        });

        const totalApostas = apostas.length;

        // 4. Calcula o Dinheiro arrecadado (Taxa) apenas das campanhas dele
        let totalArrecadado = 0;
        apostas.forEach(aposta => {
            const valorBolao = Number(aposta.campanha_opcao?.campanha?.valor_bolao || 0);
            const taxa = Number(aposta.campanha_opcao?.campanha?.taxa_operacional || 0) / 100;
            totalArrecadado += (valorBolao * taxa);
        });

        return res.status(httpStatus.OK).json({
            totalCampanhas,
            campanhasAtivas: 0, // Pode usar se quiser expandir o dashboard depois
            totalApostas,
            totalArrecadado
        });

    } catch (error) {
        console.error("🔥 ERRO NO DASHBOARD:", error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao carregar métricas' });
    }
};