
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const services = [
    {
        name: "Corte Clássico",
        price: 45.00,
        description: "Corte tradicional com tesoura e máquina, acabamento na navalha.",
        icon: "Scissors",
        duration: 45,
        order: 1
    },
    {
        name: "Barba Terapia",
        price: 35.00,
        description: "Modelagem de barba com toalha quente e massagem facial.",
        icon: "User",
        duration: 30,
        order: 2
    },
    {
        name: "Corte + Barba",
        price: 70.00,
        description: "Combo completo para renovar o visual. Inclui lavagem.",
        icon: "Crown",
        duration: 75,
        order: 3
    },
    {
        name: "Pezinho / Acabamento",
        price: 20.00,
        description: "Manutenção do contorno e limpeza dos pelos do pescoço.",
        icon: "Zap",
        duration: 15,
        order: 4
    },
    {
        name: "Sobrancelha",
        price: 15.00,
        description: "Design e limpeza de sobrancelha com navalha ou pinça.",
        icon: "Scissors",
        duration: 15,
        order: 5
    },
    {
        name: "Hidratação Capilar",
        price: 50.00,
        description: "Tratamento profundo para fortalecer e dar brilho aos fios.",
        icon: "User",
        duration: 40,
        order: 6
    },
];

async function main() {
    console.log('Start seeding services...');
    for (const service of services) {
        const existing = await prisma.service.findFirst({
            where: { name: service.name }
        });

        if (!existing) {
            await prisma.service.create({
                data: service
            });
            console.log(`Created service: ${service.name}`);
        } else {
            console.log(`Service already exists: ${service.name}`);
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
