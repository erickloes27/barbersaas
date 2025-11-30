
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Obter usuários e serviços existentes
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    const services = await prisma.barberService.findMany();

    if (users.length === 0 || services.length === 0) {
        console.log('Certifique-se de ter usuários e serviços cadastrados.');
        return;
    }

    const appointments = [];
    const statuses = ['COMPLETED', 'CANCELLED'];

    // Gerar agendamentos para os últimos 30 dias
    for (let i = 0; i < 15; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        // Data aleatória nos últimos 30 dias
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        date.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0); // Entre 9h e 18h

        appointments.push({
            userId: randomUser.id,
            serviceId: randomService.id,
            date: date,
            status: randomStatus,
        });
    }

    // Adicionar alguns agendamentos para HOJE e AMANHÃ (SCHEDULED)
    for (let i = 0; i < 5; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];

        const date = new Date();
        if (i > 2) date.setDate(date.getDate() + 1); // Alguns para amanhã
        date.setHours(10 + i, 0, 0, 0);

        appointments.push({
            userId: randomUser.id,
            serviceId: randomService.id,
            date: date,
            status: 'SCHEDULED',
        });
    }

    for (const apt of appointments) {
        await prisma.appointment.create({
            data: apt,
        });
    }

    console.log('Histórico de agendamentos criado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
