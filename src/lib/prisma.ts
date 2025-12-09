import { PrismaClient } from "@prisma/client";
// Force TS reload

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Conexão com o Banco de Dados (Prisma Client)
 * 
 * Este arquivo garante que a gente tenha apenas UMA conexão com o banco
 * ativa por vez, especialmente útil durante o desenvolvimento (hot reload).
 * 
 * Use `import { prisma } from "@/lib/prisma"` em qualquer arquivo
 * para acessar o banco de dados.
 */
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"], // Mostra as queries SQL no terminal (útil para debug)
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
