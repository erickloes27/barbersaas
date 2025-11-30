
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testando acesso ao modelo BarbershopSettings...');
    try {
        const settings = await prisma.barbershopSettings.findFirst();
        console.log('Sucesso! Settings:', settings);
    } catch (error) {
        console.error('Erro ao acessar BarbershopSettings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
