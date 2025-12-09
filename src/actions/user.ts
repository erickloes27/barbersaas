"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
    cpf: z.string().min(11, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birthDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Data inválida",
    }),
});

export async function completeProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const data = {
        cpf: formData.get("cpf") as string,
        phone: formData.get("phone") as string,
        birthDate: formData.get("birthDate") as string,
    };

    const validated = profileSchema.safeParse(data);

    if (!validated.success) {
        throw new Error("Dados inválidos");
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            cpf: validated.data.cpf,
            phone: validated.data.phone,
            birthDate: new Date(validated.data.birthDate),
        },
    });

    redirect("/dashboard");
}

export async function updateProfile(formData: FormData) {
    console.log("updateProfile iniciado");
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    const imageFile = formData.get("imageFile") as File;
    let imagePath = undefined;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const uploadDir = join(process.cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imagePath = `/uploads/${filename}`;
        } catch (error) {
            console.error("Erro ao salvar imagem:", error);
            return { error: "Erro ao salvar imagem de perfil." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        cpf: formData.get("cpf") as string,
        phone: formData.get("phone") as string,
        birthDate: formData.get("birthDate") as string,
    };

    if (!data.name || !data.email) {
        return { error: "Nome e Email são obrigatórios." };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                phone: data.phone,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                ...(imagePath && { image: imagePath }),
            },
        });
        revalidatePath("/dashboard/profile");
        return { success: "Perfil atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return { error: "Erro ao atualizar perfil." };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/dashboard/clients");
        return { success: "Usuário removido com sucesso!" };
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        return { error: "Erro ao remover usuário." };
    }
}
