"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const barberSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    bio: z.string().nullish(),
    instagram: z.string().nullish(),
    imageUrl: z.string().nullish(),
});

export async function createBarber(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    let barbershopId = session.user.barbershopId;

    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId as string;
    }

    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        return { error: "Barbearia não identificada." };
    }

    const imageFile = formData.get("imageFile") as File;
    let imageUrl = formData.get("imageUrl") as string;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const mimeType = imageFile.type || 'image/jpeg';
            imageUrl = `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            return { error: "Erro ao processar imagem do barbeiro." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        instagram: formData.get("instagram") as string,
        imageUrl: imageUrl,
    };

    const validated = barberSchema.safeParse(data);

    if (!validated.success) {
        console.log("Validation error:", validated.error);
        return { error: "Dados inválidos. Verifique os campos." };
    }

    try {
        await prisma.barber.create({
            data: {
                name: validated.data.name,
                bio: validated.data.bio || null,
                instagram: validated.data.instagram || null,
                imageUrl: validated.data.imageUrl || null,
                barbershopId: barbershopId,
            },
        });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro adicionado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar barbeiro:", error);
        return { error: `Erro ao criar barbeiro: ${(error as Error).message}` };
    }
}

export async function updateBarber(id: string, formData: FormData) {
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const mimeType = imageFile.type || 'image/jpeg';
            imageUrl = `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            return { error: "Erro ao processar imagem do barbeiro." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        instagram: formData.get("instagram") as string,
        imageUrl: imageUrl || (formData.get("imageUrl") as string),
    };

    const validated = barberSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    try {
        await prisma.barber.update({
            where: { id },
            data: {
                name: validated.data.name,
                bio: validated.data.bio || null,
                instagram: validated.data.instagram || null,
                imageUrl: validated.data.imageUrl || null,
            },
        });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro atualizado com sucesso!" };
    } catch (error) {
        return { error: "Erro ao atualizar barbeiro." };
    }
}

export async function deleteBarber(id: string) {
    try {
        await prisma.barber.delete({ where: { id } });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro removido com sucesso!" };
    } catch (error) {
        return { error: "Erro ao remover barbeiro." };
    }
}
