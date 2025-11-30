import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPassword() {
    const email = "admin@barber.com";
    const newPassword = "123456";

    console.log(`Resetando senha para: ${email}`);

    const hash = await bcrypt.hash(newPassword, 10);
    console.log(`Novo hash gerado: ${hash}`);

    await prisma.user.update({
        where: { email },
        data: { password: hash },
    });

    console.log("✅ Senha atualizada no banco!");

    // Verificação imediata
    const user = await prisma.user.findUnique({ where: { email } });
    const isValid = await bcrypt.compare(newPassword, user?.password || "");

    console.log(`Verificação imediata: ${isValid ? "SUCESSO" : "FALHA"}`);
}

resetPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
