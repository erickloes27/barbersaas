"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookingSchema = z.object({
    serviceId: z.string().min(1, "Serviço é obrigatório"),
    barberId: z.string().min(1, "Barbeiro é obrigatório"),
    date: z.string().min(1, "Data e hora são obrigatórios"), // ISO string
});

export async function getAvailableSlots(dateStr: string, barberId: string) {
    const selectedDate = new Date(dateStr);
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Segunda...

    // Buscar o barbershopId através do barberId
    const barber = await prisma.barber.findUnique({
        where: { id: barberId },
        select: { barbershopId: true },
    });

    if (!barber) {
        return [];
    }

    // Buscar horário de funcionamento para o dia da semana
    const schedule = await prisma.daySchedule.findUnique({
        where: {
            barbershopId_dayOfWeek: {
                barbershopId: barber.barbershopId,
                dayOfWeek,
            },
        },
    });

    // Se não houver horário definido ou estiver fechado, retorna vazio
    if (!schedule || !schedule.active) {
        return [];
    }

    // Buscar configurações da barbearia para obter a duração do slot
    const settings = await prisma.barbershop.findFirst();
    const slotDuration = settings?.slotDuration || 60; // Default 60 min

    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const startMinute = parseInt(schedule.startTime.split(":")[1] || "0");
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    const endMinute = parseInt(schedule.endTime.split(":")[1] || "0");

    let pauseStartHour = -1;
    let pauseStartMinute = 0;
    let pauseEndHour = -1;
    let pauseEndMinute = 0;

    if (schedule.pauseStart && schedule.pauseEnd) {
        pauseStartHour = parseInt(schedule.pauseStart.split(":")[0]);
        pauseStartMinute = parseInt(schedule.pauseStart.split(":")[1] || "0");
        pauseEndHour = parseInt(schedule.pauseEnd.split(":")[0]);
        pauseEndMinute = parseInt(schedule.pauseEnd.split(":")[1] || "0");
    }

    const slots = [];
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar agendamentos existentes para esse barbeiro nesse dia
    const existingAppointments = await prisma.appointment.findMany({
        where: {
            barberId: barberId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: {
                not: "CANCELLED",
            },
        },
    });

    // Converter horários para minutos desde o início do dia para facilitar cálculos
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const pauseStartTotalMinutes = pauseStartHour !== -1 ? pauseStartHour * 60 + pauseStartMinute : -1;
    const pauseEndTotalMinutes = pauseEndHour !== -1 ? pauseEndHour * 60 + pauseEndMinute : -1;

    // Gerar slots
    for (let currentMinutes = startTotalMinutes; currentMinutes < endTotalMinutes; currentMinutes += slotDuration) {
        // Verificar se está dentro do horário de pausa
        if (pauseStartTotalMinutes !== -1 && currentMinutes >= pauseStartTotalMinutes && currentMinutes < pauseEndTotalMinutes) {
            continue;
        }

        // Verificar se o slot cabe antes do fim do dia ou antes da pausa
        if (currentMinutes + slotDuration > endTotalMinutes) {
            break;
        }
        if (pauseStartTotalMinutes !== -1 && currentMinutes < pauseStartTotalMinutes && currentMinutes + slotDuration > pauseStartTotalMinutes) {
            continue; // Slot cortado pela pausa
        }

        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;

        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Verificar se já existe agendamento neste horário
        const isBooked = existingAppointments.some((apt) => {
            const aptTime = new Date(apt.date);
            // Margem de erro de 1 minuto para comparações
            return Math.abs(aptTime.getTime() - slotTime.getTime()) < 60000;
        });

        // Verificar se é passado (se for hoje)
        const now = new Date();
        const isPast = slotTime < now;

        if (!isBooked && !isPast) {
            slots.push(slotTime.toISOString());
        }
    }

    return slots;
}

export async function createBooking(formData: FormData) {
    console.log("--- INICIANDO CREATE BOOKING ---");
    const session = await auth();
    if (!session?.user?.email) {
        console.log("Erro: Usuário não logado");
        return { error: "Você precisa estar logado para agendar." };
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        console.log("Erro: Usuário não encontrado no banco");
        return { error: "Usuário não encontrado." };
    }

    const data = {
        serviceId: formData.get("serviceId") as string,
        barberId: formData.get("barberId") as string,
        date: formData.get("date") as string,
    };
    console.log("Dados recebidos:", data);

    const validated = bookingSchema.safeParse(data);

    if (!validated.success) {
        console.log("Erro de validação:", validated.error);
        return { error: "Dados inválidos." };
    }

    try {
        // Verificar disponibilidade novamente (concorrência)
        const appointmentDate = new Date(validated.data.date);
        console.log("Data convertida:", appointmentDate);

        const existing = await prisma.appointment.findFirst({
            where: {
                barberId: validated.data.barberId,
                date: appointmentDate,
                status: { not: "CANCELLED" },
            },
        });

        if (existing) {
            console.log("Conflito: Horário já reservado");
            return { error: "Este horário acabou de ser reservado. Por favor, escolha outro." };
        }

        // Buscar ID da barbearia (Temporário: pega o primeiro)
        const barbershop = await prisma.barbershop.findFirst();
        if (!barbershop) {
            return { error: "Barbearia não encontrada." };
        }

        const newAppointment = await prisma.appointment.create({
            data: {
                userId: user.id,
                serviceId: validated.data.serviceId,
                barberId: validated.data.barberId,
                barbershopId: barbershop.id,
                date: appointmentDate,
                status: "SCHEDULED",
            },
        });
        console.log("Agendamento criado com sucesso:", newAppointment);

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/appointments");
        return { success: "Agendamento realizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar agendamento:", error);
        return { error: "Erro ao realizar agendamento." };
    }
}
