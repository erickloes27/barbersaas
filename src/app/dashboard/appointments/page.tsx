import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, User, MoreHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateAppointmentStatus, updateAppointmentStatusVoid } from "@/actions/appointment";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";
import { ClientDetailsSheet } from "@/components/dashboard/client-details-sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageProps {
    searchParams: Promise<{ date?: string }>;
}

import { auth } from "@/auth";

// ... (imports)

export default async function AppointmentsPage(props: PageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    const searchParams = await props.searchParams;
    const dateParam = searchParams.date;
    const { barbershopId: paramBarbershopId } = await props.searchParams as any; // Type assertion temporário ou atualizar interface

    // Resolver Barbershop Context
    let targetBarbershopId: string | undefined;

    if (userRole === "MASTER" && paramBarbershopId) {
        targetBarbershopId = paramBarbershopId;
    } else if (userRole === "ADMIN") {
        targetBarbershopId = session?.user?.barbershopId || undefined;
        if (!targetBarbershopId && session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId || undefined;
        }
    }

    // Filtro base
    const whereFilter: any = {};
    if (userRole === "USER") {
        whereFilter.userId = userId;
    } else if (targetBarbershopId) {
        whereFilter.barbershopId = targetBarbershopId;
    } else if (userRole === "ADMIN") {
        // Admin sem barbearia não vê nada
        whereFilter.barbershopId = "invalid";
    }

    // 1. Agendamentos de HOJE
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsToday = await prisma.appointment.findMany({
        where: {
            ...whereFilter,
            date: {
                gte: todayStart,
                lte: todayEnd,
            },
        },
        include: {
            user: true,
            service: true,
            barber: true,
        },
        orderBy: { date: "asc" },
    });

    // 2. Agendamentos da Data Selecionada
    let appointmentsSelected: any[] = [];
    let selectedDateDisplay = "";

    if (dateParam) {
        const start = new Date(dateParam + "T00:00:00");
        const end = new Date(dateParam + "T23:59:59");
        selectedDateDisplay = start.toLocaleDateString("pt-BR");

        appointmentsSelected = await prisma.appointment.findMany({
            where: {
                ...whereFilter,
                date: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                user: true,
                service: true,
                barber: true,
            },
            orderBy: { date: "asc" },
        });
    }

    const statusMap: Record<string, { label: string; color: string }> = {
        SCHEDULED: { label: "Agendado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        COMPLETED: { label: "Concluído", color: "bg-green-500/10 text-green-500 border-green-500/20" },
        CANCELLED: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
    };

    // 3. Buscar dias com agendamentos para marcar no calendário
    const allAppointments = await prisma.appointment.findMany({
        where: whereFilter,
        select: { date: true },
    });
    const bookedDays = allAppointments.map(apt => apt.date);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Agendamentos</h2>
            </div>

            {/* Seção Superior - Agendamentos de HOJE */}
            <div className="w-full">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle>Agendamentos de Hoje ({new Date().toLocaleDateString("pt-BR")})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableHead className="text-zinc-400">Cliente</TableHead>
                                    <TableHead className="text-zinc-400">Serviço</TableHead>
                                    <TableHead className="text-zinc-400">Barbeiro</TableHead>
                                    <TableHead className="text-zinc-400">Horário</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-right text-zinc-400">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointmentsToday.map((appointment) => (
                                    <TableRow key={appointment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium">
                                            <ClientDetailsSheet user={appointment.user}>
                                                <Button variant="link" className="text-white p-0 h-auto font-medium hover:text-yellow-500">
                                                    {appointment.user.name}
                                                </Button>
                                            </ClientDetailsSheet>
                                        </TableCell>
                                        <TableCell>{appointment.service.name}</TableCell>
                                        <TableCell>{appointment.barber?.name || "-"}</TableCell>
                                        <TableCell>
                                            {new Date(appointment.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusMap[appointment.status]?.color}>
                                                {statusMap[appointment.status]?.label || appointment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <ClientDetailsSheet user={appointment.user}>
                                                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10 h-8 w-8">
                                                        <User size={16} />
                                                    </Button>
                                                </ClientDetailsSheet>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 w-8">
                                                            <MoreHorizontal size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                                                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <form action={updateAppointmentStatusVoid.bind(null, appointment.id, "SCHEDULED")}>
                                                            <button className="w-full text-left cursor-pointer"><DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer"><CalendarIcon className="mr-2 h-4 w-4 text-blue-500" /><span>Agendado</span></DropdownMenuItem></button>
                                                        </form>
                                                        <form action={updateAppointmentStatusVoid.bind(null, appointment.id, "COMPLETED")}>
                                                            <button className="w-full text-left cursor-pointer"><DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer"><Check className="mr-2 h-4 w-4 text-green-500" /><span>Concluído</span></DropdownMenuItem></button>
                                                        </form>
                                                        <form action={updateAppointmentStatusVoid.bind(null, appointment.id, "CANCELLED")}>
                                                            <button className="w-full text-left cursor-pointer"><DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer"><X className="mr-2 h-4 w-4 text-red-500" /><span>Cancelado</span></DropdownMenuItem></button>
                                                        </form>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {appointmentsToday.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                            Nenhum agendamento para hoje.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Seção Inferior - Histórico e Calendário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Calendário (Esquerda) */}
                <div className="w-full md:col-span-1">
                    <AppointmentCalendar bookedDays={bookedDays} />
                </div>

                {/* Lista da Data Selecionada (Direita) */}
                <div className="w-full md:col-span-2">
                    <Card className="bg-zinc-900 border-zinc-800 text-white h-full min-h-[350px]">
                        <CardHeader>
                            <CardTitle>
                                {dateParam ? `Histórico de ${selectedDateDisplay}` : "Histórico por Data"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!dateParam ? (
                                <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                                    <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Selecione uma data no calendário para ver o histórico.</p>
                                </div>
                            ) : appointmentsSelected.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                                    <X className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Nenhum agendamento encontrado para {selectedDateDisplay}.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {appointmentsSelected.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center text-yellow-500 font-bold">
                                                    {apt.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{apt.user.name}</p>
                                                    <p className="text-sm text-zinc-400">{apt.service.name} - {new Date(apt.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={statusMap[apt.status]?.color}>
                                                {statusMap[apt.status]?.label || apt.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
