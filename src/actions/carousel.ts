"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const carouselSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().optional(),
    ctaText: z.string().min(1, "Texto do botão é obrigatório"),
    ctaLink: z.string().min(1, "Link do botão é obrigatório"),
    imageUrl: z.string().optional(),
    order: z.string().transform((val) => parseInt(val || "0")),
});

import { auth } from "@/auth";

export async function getCarouselItems(overrideId?: string) {
    const session = await auth();
    // Permitir acesso público? Talvez para a Home Page. Mas aqui é para o Dashboard?
    // Se for para a Home Page, não precisa de auth. Mas se for para o Dashboard, precisa.
    // O componente CarouselList é usado no Dashboard.
    // Vamos assumir que se tiver overrideId ou session, filtramos. Se não, retorna vazio ou tudo (perigoso).
    // Para a Home Page (pública), provavelmente teremos outra action ou essa mesma sem auth.
    // Mas aqui estamos focando no Dashboard.

    let barbershopId = overrideId;

    if (session?.user?.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId && session?.user) {
        barbershopId = session.user.barbershopId || undefined;
        if (!barbershopId && session.user.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            barbershopId = user?.barbershopId as string;
        }
    }

    if (!barbershopId) return [];

    return await prisma.carouselItem.findMany({
        where: { barbershopId },
        orderBy: { order: "asc" },
    });
}

export async function createCarouselItem(formData: FormData) {
    console.log("Server Action: createCarouselItem called");
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
            return { error: "Erro ao processar imagem do slide." };
        }
    }

    if (!imageUrl) {
        return { error: "Imagem é obrigatória." };
    }

    const data = {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        ctaText: formData.get("ctaText") as string,
        ctaLink: formData.get("ctaLink") as string,
        imageUrl: imageUrl,
        order: formData.get("order") as string,
    };

    const validated = carouselSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    let barbershopId = session.user.barbershopId || undefined;

    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId || undefined;
    }

    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        return { error: "Barbearia não identificada." };
    }

    try {
        await prisma.carouselItem.create({
            data: {
                title: validated.data.title,
                subtitle: validated.data.subtitle,
                ctaText: validated.data.ctaText,
                ctaLink: validated.data.ctaLink,
                imageUrl: validated.data.imageUrl!, // Garantido pela verificação acima
                order: validated.data.order,
                barbershopId: barbershopId,
            },
        });
        revalidatePath("/");
        revalidatePath("/dashboard/settings/carousel");
        return { success: "Slide criado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar slide:", error);
        return { error: "Erro ao criar slide." };
    }
}

export async function updateCarouselItem(id: string, formData: FormData) {
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
            return { error: "Erro ao processar imagem do slide." };
        }
    }

    const data = {
        title: formData.get("title") as string,
        subtitle: formData.get("subtitle") as string,
        ctaText: formData.get("ctaText") as string,
        ctaLink: formData.get("ctaLink") as string,
        imageUrl: imageUrl || (formData.get("imageUrl") as string),
        order: formData.get("order") as string,
    };

    const validated = carouselSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    try {
        await prisma.carouselItem.update({
            where: { id },
            data: {
                title: validated.data.title,
                subtitle: validated.data.subtitle,
                ctaText: validated.data.ctaText,
                ctaLink: validated.data.ctaLink,
                order: validated.data.order,
                ...(imageUrl && { imageUrl }),
            },
        });
        revalidatePath("/");
        revalidatePath("/dashboard/settings/carousel");
        return { success: "Slide atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar slide:", error);
        return { error: "Erro ao atualizar slide." };
    }
}

export async function deleteCarouselItem(id: string) {
    try {
        await prisma.carouselItem.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/dashboard/settings/carousel");
        return { success: "Slide removido com sucesso!" };
    } catch (error) {
        return { error: "Erro ao remover slide." };
    }
}
