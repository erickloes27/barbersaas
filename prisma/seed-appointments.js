const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed de agendamentos...');

    // Buscar usuários e serviços existentes
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    const services = await prisma.service.findMany();

    if (users.length === 0 || services.length === 0) {
        console.log('É necessário ter usuários e serviços cadastrados.');
        return;
    }

    const appointments = [
        {
            userId: users[0].id,
            serviceId: services[0].id,
            date: new Date(new Date().setHours(10, 0, 0, 0)), // Hoje 10:00
            status: 'SCHEDULED',
        },
        {
            userId: users[1].id,
            serviceId: services[0].id,
            date: new Date(new Date().setHours(14, 30, 0, 0)), // Hoje 14:30
            status: 'SCHEDULED',
        },
        {
            userId: users[2].id,
            serviceId: services[1].id,
            date: new Date(new Date().setDate(new Date().getDate() + 1)), // Amanhã
            status: 'SCHEDULED',
        },
        {
            userId: users[0].id,
            serviceId: services[1].id,
            date: new Date(new Date().setDate(new Date().getDate() - 1)), // Ontem
            status: 'COMPLETED',
        },
        {
            userId: users[3].id,
            serviceId: services[0].id,
            date: new Date(new Date().setDate(new Date().getDate() - 2)), // Anteontem
            status: 'CANCELLED',
        },
    ];

    for (const app of appointments) {
        await prisma.appointment.create({
            data: app,
        });
    }

    console.log(`${appointments.length} agendamentos criados.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
