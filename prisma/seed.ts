import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@barber.com';
    const password = await bcrypt.hash('123456', 10);

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

    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
