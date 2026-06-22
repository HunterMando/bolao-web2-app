import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando o semeio de dados (Database Seed)...');

    // 1. POPULAR OS TIPOS DE CAMPANHA (ESPORTES)
    const esportes = [
        { descricao: 'Futebol' },
        { descricao: 'Basquete' },
        { descricao: 'Tênis' },
        { descricao: 'MMA' },
        { descricao: 'Vôlei' },
        { descricao: 'E-sports' }
    ];

    console.log('-> Cadastrando tipos de campanha...');
    for (const esporte of esportes) {
        // Verifica se já existe para não duplicar se rodar o comando duas vezes
        const existe = await prisma.tipoCampanha.findFirst({
            where: { descricao: esporte.descricao }
        });

        if (!existe) {
            await prisma.tipoCampanha.create({
                data: {
                    descricao: esporte.descricao,
                    status: true
                }
            });
        }
    }

    // 2. POPULAR OS MEIOS DE PAGAMENTO
    const meiosPagamento = [
        { descricao: 'PIX' },
        { descricao: 'Cartão de Crédito' },
        { descricao: 'Boleto Bancário' },
        { descricao: 'Dinheiro' },
        { descricao: 'Transferência Bancária' },
        { descricao: 'PayPal' }
    ];

    console.log('-> Cadastrando meios de pagamento...');
    for (const meio of meiosPagamento) {
        const existe = await prisma.meioPagamento.findFirst({
            where: { descricao: meio.descricao }
        });

        if (!existe) {
            await prisma.meioPagamento.create({
                data: {
                    descricao: meio.descricao,
                    status: true
                }
            });
        }
    }

    console.log('✨ Banco de dados semeado com sucesso! Tudo pronto para os testes.');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao rodar o seed:', e);
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });