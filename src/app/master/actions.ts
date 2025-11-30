"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createBarbershopSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres")
        .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
});

export async function createBarbershop(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "MASTER") {
        return { error: "Unauthorized" };
    }

    const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
    };

    const validated = createBarbershopSchema.safeParse(data);

    if (!validated.success) {
        return { error: validated.error.issues[0]?.message || "Erro de validação." };
    }

    try {
        // Verificar se slug já existe
        const existing = await prisma.barbershop.findUnique({
            where: { slug: validated.data.slug },
        });

        if (existing) {
            return { error: "Este slug já está em uso." };
        }

        await prisma.barbershop.create({
            data: {
                name: validated.data.name,
                slug: validated.data.slug,
                primaryColor: "#fbbf24",
                secondaryColor: "#18181b",
            },
        });

        revalidatePath("/master");
    } catch (error) {
        console.error("Erro ao criar barbearia:", error);
        return { error: "Erro ao criar barbearia." };
    }
}

const createAdminUserSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    barbershopId: z.string().min(1, "Barbearia é obrigatória"),
});

export async function createAdminUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "MASTER") {
        return { error: "Unauthorized" };
    }

    const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        barbershopId: formData.get("barbershopId") as string,
    };

    const validated = createAdminUserSchema.safeParse(data);

    if (!validated.success) {
        return { error: validated.error.issues[0]?.message || "Erro de validação." };
    }

    try {
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.data.email },
        });

        if (existingUser) {
            return { error: "Este e-mail já está em uso." };
        }

        const hashedPassword = await bcrypt.hash(validated.data.password, 10);

        await prisma.user.create({
            data: {
                name: validated.data.name,
                email: validated.data.email,
                password: hashedPassword,
                role: "ADMIN",
                barbershopId: validated.data.barbershopId,
            },
        });

        revalidatePath(`/master/barbershops/${validated.data.barbershopId}`);
        return { success: "Usuário criado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar usuário admin:", error);
        return { error: "Erro ao criar usuário." };
    }
}
