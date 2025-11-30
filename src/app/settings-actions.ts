"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function getSettings(overrideId?: string) {
    const session = await auth();

    // Se não estiver logado, retorna null
    if (!session?.user) return null;

    let barbershopId = overrideId || session.user.barbershopId || undefined;

    // Se for MASTER e não tiver ID específico, pega o primeiro (ou o do override)
    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    // Se for ADMIN e não tiver ID na sessão, tenta fallback do banco
    if (session.user.role !== "MASTER" && !barbershopId) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId as string;
    }

    if (!barbershopId) {
        return null;
    }

    const settings = await prisma.barbershop.findUnique({
        where: { id: barbershopId },
    });

    return settings;
}

export async function updateSettings(formData: FormData) {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Usuário não autenticado." };
    }

    // Tenta pegar ID do form (para Master) ou da sessão
    let barbershopId = formData.get("barbershopId") as string;

    // Se não veio no form ou se não é MASTER, usa a lógica de segurança da sessão
    if (session.user.role !== "MASTER") {
        barbershopId = session.user.barbershopId as string;

        // Fallback do banco para Admin
        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            barbershopId = user?.barbershopId as string;
        }
    }

    if (!barbershopId) {
        return { error: "Barbearia não identificada." };
    }

    const name = (formData.get("name") as string) || "";
    const phone = (formData.get("phone") as string) || "";

    // Logo Upload
    const logoFile = formData.get("logoFile") as File;
    let logoUrl = undefined;

    if (logoFile && logoFile.size > 0) {
        try {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `logo-${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const uploadDir = join(process.cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            logoUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error("Erro ao salvar logo:", error);
            throw new Error("Erro ao salvar logo.");
        }
    }

    // Address Fields
    const cep = (formData.get("cep") as string) || "";
    const street = (formData.get("street") as string) || "";
    const number = (formData.get("number") as string) || "";
    const complement = (formData.get("complement") as string) || "";
    const neighborhood = (formData.get("neighborhood") as string) || "";
    const city = (formData.get("city") as string) || "";
    const state = (formData.get("state") as string) || "";

    // Hours Fields
    const weekDaysOpen = (formData.get("weekDaysOpen") as string) || "09:00";
    const weekDaysClose = (formData.get("weekDaysClose") as string) || "20:00";
    const saturdayOpen = (formData.get("saturdayOpen") as string) || "09:00";
    const saturdayClose = (formData.get("saturdayClose") as string) || "18:00";
    const sundayOpen = (formData.get("sundayOpen") as string) || "";
    const sundayClose = (formData.get("sundayClose") as string) || "";

    const data = {
        name,
        phone,
        ...(logoUrl && { logoUrl }),
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        weekDaysOpen,
        weekDaysClose,
        saturdayOpen,
        saturdayClose,
        sundayOpen,
        sundayClose,

        // Social Media
        instagramUrl: (formData.get("instagramUrl") as string) || null,
        instagramActive: formData.get("instagramActive") === "on",
        facebookUrl: (formData.get("facebookUrl") as string) || null,
        facebookActive: formData.get("facebookActive") === "on",
        twitterUrl: (formData.get("twitterUrl") as string) || null,
        twitterActive: formData.get("twitterActive") === "on",
        tiktokUrl: (formData.get("tiktokUrl") as string) || null,
        tiktokActive: formData.get("tiktokActive") === "on",
        whatsappUrl: (formData.get("whatsappUrl") as string) || null,
        whatsappActive: formData.get("whatsappActive") === "on",
    };

    console.log("Updating settings for barbershop:", barbershopId, data);

    try {
        await prisma.barbershop.update({
            where: { id: barbershopId },
            data,
        });

        revalidatePath("/");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar configurações:", error);
        return { error: `Erro ao salvar: ${(error as Error).message}` };
    }
}
