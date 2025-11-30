import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "cliente@teste.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: "USER",
        },
        create: {
            email,
            name: "Cliente Teste",
            password: hashedPassword,
            role: "USER",
        },
    });

    console.log(`Usuário criado/atualizado: ${user.email}`);
    console.log(`Senha: ${password}`);
    console.log(`Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
