"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const serviceSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    price: z.string().transform((val) => parseFloat(val.replace(",", "."))),
    duration: z.string().transform((val) => parseInt(val)),
    icon: z.string().optional(),
    order: z.string().transform((val) => parseInt(val || "0")),
});

export async function createService(formData: FormData) {
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

    const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: formData.get("price") as string,
        duration: formData.get("duration") as string,
        icon: formData.get("icon") as string,
        order: formData.get("order") as string,
    };

    const validated = serviceSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos. Verifique os campos." };
    }

    try {
        await prisma.service.create({
            data: {
                name: validated.data.name,
                description: validated.data.description,
                price: validated.data.price,
                duration: validated.data.duration,
                icon: validated.data.icon,
                order: validated.data.order,
                barbershopId: barbershopId,
            },
        });
        revalidatePath("/dashboard/services");
        revalidatePath("/");
        return { success: "Serviço criado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar serviço:", error);
        return { error: `Erro ao criar serviço: ${(error as Error).message}` };
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({ where: { id } });
        revalidatePath("/dashboard/services");
        return { success: "Serviço removido com sucesso!" };
    } catch (error) {
        return { error: "Erro ao remover serviço." };
    }
}

export async function updateService(id: string, formData: FormData) {
    const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: formData.get("price") as string,
        duration: formData.get("duration") as string,
        icon: formData.get("icon") as string,
        order: formData.get("order") as string,
    };

    const updateSchema = z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        price: z.string().transform((val) => parseFloat(val.replace(",", "."))),
        duration: z.string().transform((val) => parseInt(val)),
        icon: z.string().optional(),
        order: z.string().transform((val) => parseInt(val)).optional(),
    });

    const validated = updateSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    try {
        await prisma.service.update({
            where: { id },
            data: {
                name: validated.data.name,
                description: validated.data.description,
                price: validated.data.price,
                duration: validated.data.duration,
                icon: validated.data.icon,
                order: validated.data.order,
            },
        });
        revalidatePath("/dashboard/services");
        revalidatePath("/");
        return { success: "Serviço atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        return { error: "Erro ao atualizar serviço." };
    }
}
