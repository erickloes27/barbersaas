"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
