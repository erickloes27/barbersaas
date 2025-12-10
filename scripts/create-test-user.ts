import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const email = "test@example.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log("User already exists. Updating to MASTER...");
        await prisma.user.update({
            where: { email },
            data: {
                role: "MASTER",
                password: hashedPassword // Reset password just in case
            }
        });
    } else {
        console.log("Creating new MASTER user...");
        await prisma.user.create({
            data: {
                name: "Test User",
                email,
                password: hashedPassword,
                role: "MASTER",
                cpf: "00000000000",
                birthDate: new Date(),
            }
        });
    }

    // Ensure a barbershop exists for this user
    // Ensure a barbershop exists
    let barbershop = await prisma.barbershop.findFirst();
    if (!barbershop) {
        console.log("Creating default barbershop...");
        barbershop = await prisma.barbershop.create({
            data: {
                name: "Test Barbershop",
                slug: "test-barbershop",
            }
        });
    }

    // Link user to barbershop
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: { barbershopId: barbershop.id }
        });
        console.log("Linked user to barbershop.");
    }

    console.log("Done. Login with test@example.com / password123");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
