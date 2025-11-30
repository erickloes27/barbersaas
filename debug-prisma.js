const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient type:', typeof PrismaClient);
try {
    const prisma = new PrismaClient();
    console.log('Instance created successfully');
    prisma.user.count().then(c => console.log('Count:', c));
} catch (e) {
    console.error('Instantiation failed:', e);
}
