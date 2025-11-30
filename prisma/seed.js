require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@barber.com';
    const password = await bcrypt.hash('123456', 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password,
                role: 'ADMIN',
            },
            create: {
                email,
                name: 'Admin User',
                password,
                role: 'ADMIN',
                cpf: '000.000.000-00',
                phone: '(11) 99999-9999',
            },
        });
        console.log('User created:', user);

        const masterUser = await prisma.user.upsert({
            where: { email: 'master@barber.com' },
            update: {
                password,
                role: 'MASTER',
            },
            create: {
                email: 'master@barber.com',
                name: 'Master User',
                password,
                role: 'MASTER',
                cpf: '111.111.111-11',
                phone: '(11) 98888-8888',
            },
        });
        console.log('Master User created:', masterUser);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
