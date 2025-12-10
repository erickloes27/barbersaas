"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/dashboard/appointments");
        return { success: "Status atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        return { error: "Erro ao atualizar status." };
    }
}

export async function updateAppointmentStatusVoid(id: string, status: string) {
    await updateAppointmentStatus(id, status);
}

export async function cancelAppointment(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!appointment) return { error: "Agendamento não encontrado" };

    // Allow if user owns it OR if user is admin/master (but here we focus on client)
    if (appointment.userId !== session.user.id && session.user.role === "USER") {
        return { error: "Você não tem permissão para cancelar este agendamento." };
    }

    try {
        await prisma.appointment.update({
            where: { id },
            data: { status: "CANCELLED" },
        });
        revalidatePath("/dashboard/appointments");
        return { success: "Agendamento cancelado com sucesso!" };
    } catch (error) {
        console.error("Erro ao cancelar:", error);
        return { error: "Erro ao cancelar agendamento." };
    }
}
