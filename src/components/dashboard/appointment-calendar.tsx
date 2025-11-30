"use client";

import { Calendar } from "@/components/ui/calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";

export function AppointmentCalendar({ bookedDays = [] }: { bookedDays?: Date[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [date, setDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        const dateParam = searchParams.get("date");
        if (dateParam) {
            // Ajustar para timezone local para exibir corretamente no calendário
            const [year, month, day] = dateParam.split('-').map(Number);
            setDate(new Date(year, month - 1, day));
        }
    }, [searchParams]);

    const handleSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            // Criar string YYYY-MM-DD baseada na data local selecionada
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            router.push(`/dashboard/appointments?date=${dateString}`);
        } else {
            router.push("/dashboard/appointments");
        }
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
                <CardTitle>Filtrar por Data</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    bookedDays={bookedDays}
                    className="rounded-md border border-zinc-800"
                    locale={ptBR}
                    classNames={{
                        day_selected: "bg-yellow-500 text-black hover:bg-yellow-400 focus:bg-yellow-500 focus:text-black",
                        day_today: "bg-zinc-800 text-white",
                    }}
                />
            </CardContent>
        </Card>
    );
}
