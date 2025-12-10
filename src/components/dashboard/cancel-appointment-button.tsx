"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelAppointment } from "@/actions/appointment";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CancelAppointmentButtonProps {
    appointmentId: string;
}

export function CancelAppointmentButton({ appointmentId }: CancelAppointmentButtonProps) {
    const [isPending, setIsPending] = useState(false);

    async function handleCancel() {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        setIsPending(true);
        try {
            const result = await cancelAppointment(appointmentId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Agendamento cancelado com sucesso!");
            }
        } catch (error) {
            toast.error("Erro ao cancelar agendamento.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCancel}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancelar"}
        </Button>
    );
}
