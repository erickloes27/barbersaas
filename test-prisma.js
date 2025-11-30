require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log('Instantiating PrismaClient...');
try {
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
    console.log('PrismaClient instantiated.');

    prisma.user.count()
        .then(c => {
            console.log('User count:', c);
            return prisma.$disconnect();
        })
        .catch(e => {
            console.error('Query failed:', e);
            return prisma.$disconnect();
        });

} catch (e) {
    console.error('Instantiation failed:', e);
}
