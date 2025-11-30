import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Promovendo o primeiro usuário para MASTER...");

    const user = await prisma.user.findFirst();

    if (!user) {
        console.log("Nenhum usuário encontrado. Cadastre-se no sistema primeiro!");
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { role: "MASTER" }
    });

    console.log(`✅ Usuário ${user.name || user.email} agora é MASTER!`);
    console.log("Acesse /master para gerenciar as barbearias.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
