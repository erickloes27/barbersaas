const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando seed...');

    // Barbeiros
    const barbers = [
        {
            name: 'Carlos Silva',
            bio: 'Master Barber com mais de 10 anos de experiência. Especialista em cortes clássicos e modernos.',
            instagram: '@carlos.barber',
            imageUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1974&auto=format&fit=crop',
        },
        {
            name: 'André Santos',
            bio: 'Especialista em barba e terapia facial. Transforma sua barba em uma obra de arte.',
            instagram: '@andre.barba',
            imageUrl: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=2080&auto=format&fit=crop',
        },
        {
            name: 'Ricardo Oliveira',
            bio: 'O rei dos cortes modernos e degradês. Sempre antenado nas últimas tendências.',
            instagram: '@ricardo.cuts',
            imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop',
        },
    ];

    for (const barber of barbers) {
        const existing = await prisma.barber.findFirst({
            where: { name: barber.name },
        });

        if (!existing) {
            await prisma.barber.create({
                data: barber,
            });
            console.log(`Barbeiro criado: ${barber.name}`);
        } else {
            console.log(`Barbeiro já existe: ${barber.name}`);
        }
    }

    // Clientes
    const passwordHash = await bcrypt.hash('123456', 10);

    const clients = [
        {
            name: 'João Souza',
            email: 'joao@email.com',
            cpf: '123.456.789-00',
            phone: '(11) 99999-0001',
            birthDate: new Date('1990-01-01'),
        },
        {
            name: 'Maria Oliveira',
            email: 'maria@email.com',
            cpf: '234.567.890-11',
            phone: '(11) 98888-0002',
            birthDate: new Date('1995-05-15'),
        },
        {
            name: 'Pedro Santos',
            email: 'pedro@email.com',
            cpf: '345.678.901-22',
            phone: '(11) 97777-0003',
            birthDate: new Date('1988-11-20'),
        },
        {
            name: 'Ana Costa',
            email: 'ana@email.com',
            cpf: '456.789.012-33',
            phone: '(11) 96666-0004',
            birthDate: new Date('2000-03-10'),
        },
        {
            name: 'Lucas Pereira',
            email: 'lucas@email.com',
            cpf: '567.890.123-44',
            phone: '(11) 95555-0005',
            birthDate: new Date('1992-07-25'),
        },
    ];

    for (const client of clients) {
        const existing = await prisma.user.findUnique({
            where: { email: client.email },
        });

        if (!existing) {
            await prisma.user.create({
                data: {
                    ...client,
                    password: passwordHash,
                    role: 'USER',
                },
            });
            console.log(`Cliente criado: ${client.name}`);
        } else {
            console.log(`Cliente já existe: ${client.name}`);
        }
    }

    console.log('Seed finalizado.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
