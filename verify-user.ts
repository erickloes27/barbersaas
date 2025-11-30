import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function verify() {
    const email = "admin@barber.com";
    const password = "123456";

    console.log(`--- INICIANDO VERIFICAÇÃO ---`);
    console.log(`Email alvo: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.error("❌ ERRO: Usuário não encontrado no banco!");
        return;
    }

    console.log(`✅ Usuário encontrado: ${user.id} (${user.role})`);

    if (!user.password) {
        console.error("❌ ERRO: Campo password está vazio/nulo!");
        return;
    }

    console.log(`Hash no banco: ${user.password}`);
    console.log(`Tentando comparar com senha: '${password}'`);

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        console.log("✅ SUCESSO: A senha bate com o hash!");
    } else {
        console.error("❌ FALHA: A senha NÃO bate com o hash!");
    }
    console.log(`--- FIM DA VERIFICAÇÃO ---`);
}

verify()
    .catch((e) => {
        console.error("Erro no script:", e);
    })
    .finally(() => prisma.$disconnect());
