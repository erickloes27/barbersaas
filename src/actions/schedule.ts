"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSchedule(barbershopId?: string, barberId?: string) {
    const session = await auth();
    // Allow public access if just fetching for display? Or restrict?
    // For now, keep restriction but maybe relax for booking flow later.
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MASTER" && session?.user?.role !== "USER") {
        // Allow USER to see schedules (for booking)
    }

    let targetBarbershopId = barbershopId;

    if (session?.user?.role === "MASTER" && !targetBarbershopId) {
        const first = await prisma.barbershop.findFirst();
        targetBarbershopId = first?.id;
    }

    if (!targetBarbershopId && session?.user) {
        targetBarbershopId = session.user.barbershopId || undefined;
        if (!targetBarbershopId && session.user.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId as string;
        }
    }

    if (!targetBarbershopId) return { schedules: [], slotDuration: 60 };

    const settings = await prisma.barbershop.findUnique({
        where: { id: targetBarbershopId },
        select: { id: true, slotDuration: true }
    });
    if (!settings) return { schedules: [], slotDuration: 60 };

    const schedules = await prisma.daySchedule.findMany({
        where: {
            barbershopId: settings.id,
            barberId: barberId || null
        },
        orderBy: { dayOfWeek: "asc" },
    });

    // Ensure we have 7 days
    const fullSchedule = [];
    for (let i = 0; i < 7; i++) {
        const existing = schedules.find(s => s.dayOfWeek === i);
        if (existing) {
            fullSchedule.push(existing);
        } else {
            fullSchedule.push({
                id: `temp-${i}`, // Temporary ID for UI
                dayOfWeek: i,
                startTime: "09:00",
                endTime: "18:00",
                pauseStart: "",
                pauseEnd: "",
                active: false, // Default to closed if not set
                barbershopId: settings.id,
                barberId: barberId || null,
            });
        }
    }

    return {
        schedules: fullSchedule,
        slotDuration: settings.slotDuration,
    };
}

export async function updateSchedule(schedules: any[], slotDuration: number, barbershopId?: string, barberId?: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MASTER") {
        return { error: "Unauthorized" };
    }

    let targetBarbershopId = barbershopId;

    if (session.user.role === "MASTER" && !targetBarbershopId) {
        const first = await prisma.barbershop.findFirst();
        targetBarbershopId = first?.id;
    }

    if (!targetBarbershopId) {
        targetBarbershopId = session.user.barbershopId || undefined;
        if (!targetBarbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId as string;
        }
    }

    if (!targetBarbershopId) return { error: "Barbearia não identificada." };

    try {
        // Atualizar duração do slot apenas se não for horário de barbeiro (ou permitir que barbeiro tenha slot diferente? Por enquanto mantém global)
        if (!barberId) {
            await prisma.barbershop.update({
                where: { id: targetBarbershopId },
                data: { slotDuration },
            });
        }

        // Atualizar horários
        for (const schedule of schedules) {
            const existing = await prisma.daySchedule.findFirst({
                where: {
                    barbershopId: targetBarbershopId,
                    barberId: barberId || null,
                    dayOfWeek: schedule.dayOfWeek,
                }
            });

            if (existing) {
                await prisma.daySchedule.update({
                    where: { id: existing.id },
                    data: {
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        active: schedule.active,
                        pauseStart: schedule.pauseStart,
                        pauseEnd: schedule.pauseEnd,
                    }
                });
            } else {
                await prisma.daySchedule.create({
                    data: {
                        barbershopId: targetBarbershopId,
                        barberId: barberId || null,
                        dayOfWeek: schedule.dayOfWeek,
                        startTime: schedule.startTime,
                        endTime: schedule.endTime,
                        active: schedule.active,
                        pauseStart: schedule.pauseStart,
                        pauseEnd: schedule.pauseEnd,
                    }
                });
            }
        }
        revalidatePath("/dashboard/schedule");
        revalidatePath("/dashboard/availability");
        return { success: "Configurações atualizadas com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar horários:", error);
        return { error: "Erro ao atualizar horários." };
    }
}
