import { PrismaClient } from '@prisma/client';

// Cria uma única instância do Prisma Client para ser usada em toda a aplicação
const prisma = new PrismaClient();

export default prisma;