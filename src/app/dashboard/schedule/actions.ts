"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSchedule(overrideId?: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MASTER") {
        throw new Error("Unauthorized");
    }

    let barbershopId = overrideId;

    if (session.user.role === "MASTER" && !barbershopId) {
        // Se for Master e não passou ID, tenta pegar o primeiro (comportamento padrão antigo) ou retorna vazio?
        // Vamos manter o comportamento de pegar o primeiro se não especificado, mas idealmente deveria ser explícito.
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        barbershopId = session.user.barbershopId || undefined;
        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            barbershopId = user?.barbershopId as string;
        }
    }

    if (!barbershopId) return { schedules: [], slotDuration: 60 };

    const settings = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
    if (!settings) return { schedules: [], slotDuration: 60 };

    const schedules = await prisma.daySchedule.findMany({
        where: { barbershopId: settings.id },
        orderBy: { dayOfWeek: "asc" },
    });

    return {
        schedules,
        slotDuration: settings.slotDuration,
    };
}

export async function updateSchedule(schedules: any[], slotDuration: number, overrideId?: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MASTER") {
        return { error: "Unauthorized" };
    }

    let barbershopId = overrideId;

    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        barbershopId = session.user.barbershopId || undefined;
        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            barbershopId = user?.barbershopId as string;
        }
    }

    if (!barbershopId) return { error: "Barbearia não identificada." };

    try {
        // Atualizar duração do slot
        await prisma.barbershop.update({
            where: { id: barbershopId },
            data: { slotDuration },
        });

        // Atualizar horários
        for (const schedule of schedules) {
            await prisma.daySchedule.upsert({
                where: {
                    barbershopId_dayOfWeek: {
                        barbershopId: barbershopId,
                        dayOfWeek: schedule.dayOfWeek,
                    },
                },
                update: {
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    active: schedule.active,
                    pauseStart: schedule.pauseStart,
                    pauseEnd: schedule.pauseEnd,
                },
                create: {
                    barbershopId: barbershopId,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    active: schedule.active,
                    pauseStart: schedule.pauseStart,
                    pauseEnd: schedule.pauseEnd,
                },
            });
        }
        revalidatePath("/dashboard/schedule");
        return { success: "Configurações atualizadas com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar horários:", error);
        return { error: "Erro ao atualizar horários." };
    }
}
