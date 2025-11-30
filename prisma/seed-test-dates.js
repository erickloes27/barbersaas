
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed de dados aleatórios...');

    // 1. Obter usuários e serviços existentes (Model corretos: User, Service)
    let users = await prisma.user.findMany({ where: { role: 'USER' } });
    let services = await prisma.service.findMany();

    // Se não houver usuários, criar alguns
    if (users.length === 0) {
        console.log('Criando usuários de teste...');
        const user1 = await prisma.user.create({
            data: { name: 'João Silva', email: 'joao@test.com', role: 'USER' },
        });
        const user2 = await prisma.user.create({
            data: { name: 'Maria Oliveira', email: 'maria@test.com', role: 'USER' },
        });
        users = [user1, user2];
    }

    // Se não houver serviços, criar alguns
    if (services.length === 0) {
        console.log('Criando serviços de teste...');
        const s1 = await prisma.service.create({
            data: { name: 'Corte Masculino', price: 35.0, duration: 30 },
        });
        const s2 = await prisma.service.create({
            data: { name: 'Barba', price: 25.0, duration: 20 },
        });
        services = [s1, s2];
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Função para gerar data aleatória no mês atual
    const getRandomDateInMonth = () => {
        const day = Math.floor(Math.random() * 28) + 1; // 1 a 28 para evitar problemas de fim de mês
        const hour = Math.floor(Math.random() * (18 - 9 + 1)) + 9; // 09:00 as 18:00
        const date = new Date(currentYear, currentMonth, day, hour, 0, 0);
        return date;
    };

    // Datas fixas importantes
    const fixedDates = [
        { label: 'Ontem', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0, 0), status: 'COMPLETED' },
        { label: 'Hoje (Manhã)', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0), status: 'SCHEDULED' },
        { label: 'Hoje (Tarde)', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0, 0), status: 'SCHEDULED' },
        { label: 'Amanhã', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0, 0), status: 'SCHEDULED' },
        // Datas futuras (Próximo Mês)
        { label: 'Próximo Mês (Dia 5)', date: new Date(today.getFullYear(), today.getMonth() + 1, 5, 10, 0, 0), status: 'SCHEDULED' },
        { label: 'Próximo Mês (Dia 15)', date: new Date(today.getFullYear(), today.getMonth() + 1, 15, 14, 0, 0), status: 'SCHEDULED' },
    ];

    // Criar agendamentos fixos
    for (const item of fixedDates) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];

        await prisma.appointment.create({
            data: {
                userId: randomUser.id,
                serviceId: randomService.id,
                date: item.date,
                status: item.status,
            },
        });
        console.log(`+ Fixo: ${item.label} - ${item.date.toLocaleDateString()}`);
    }

    // Criar 15 agendamentos aleatórios no mês ATUAL
    console.log('Gerando 15 agendamentos aleatórios (Mês Atual)...');
    for (let i = 0; i < 15; i++) {
        const date = getRandomDateInMonth();
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];

        // Status baseado se a data já passou
        const status = date < today ? 'COMPLETED' : 'SCHEDULED';

        await prisma.appointment.create({
            data: {
                userId: randomUser.id,
                serviceId: randomService.id,
                date: date,
                status: status,
            },
        });
    }

    // Criar 5 agendamentos aleatórios no PRÓXIMO mês
    console.log('Gerando 5 agendamentos aleatórios (Próximo Mês)...');
    const nextMonth = currentMonth + 1;
    for (let i = 0; i < 5; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const hour = Math.floor(Math.random() * (18 - 9 + 1)) + 9;
        const date = new Date(currentYear, nextMonth, day, hour, 0, 0);

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];

        await prisma.appointment.create({
            data: {
                userId: randomUser.id,
                serviceId: randomService.id,
                date: date,
                status: 'SCHEDULED',
            },
        });
    }

    console.log('Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
