import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, isSameDay, isSameWeek, isSameMonth, endOfDay, endOfWeek, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ServiceRevenueChart } from "@/components/dashboard/service-revenue-chart";
import { TimeRevenueChart } from "@/components/dashboard/time-revenue-chart";

import { auth } from "@/auth";

interface FinancialPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function FinancialPage({ searchParams }: FinancialPageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const { barbershopId: paramBarbershopId } = await searchParams;

    let targetBarbershopId: string | undefined;

    if (userRole === "MASTER" && paramBarbershopId) {
        targetBarbershopId = paramBarbershopId;
    } else {
        targetBarbershopId = session?.user?.barbershopId || undefined;

        if (!targetBarbershopId && session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId || undefined;
        }
    }

    const whereClause: any = { status: "COMPLETED" };
    if (targetBarbershopId) {
        whereClause.barbershopId = targetBarbershopId;
    } else if (userRole === "ADMIN") {
        whereClause.barbershopId = "invalid";
    }

    // Buscar todos os agendamentos concluídos (Receita)
    const completedAppointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            user: true,
            service: true,
        },
        orderBy: { date: "desc" },
    });

    const totalRevenue = completedAppointments.reduce((acc, curr) => {
        return acc + Number(curr.service.price);
    }, 0);

    // 1. Agregação por Serviço
    const serviceRevenueMap = new Map<string, number>();
    completedAppointments.forEach(apt => {
        const current = serviceRevenueMap.get(apt.service.name) || 0;
        serviceRevenueMap.set(apt.service.name, current + Number(apt.service.price));
    });

    const COLORS = ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#78350f"];
    const serviceRevenueData = Array.from(serviceRevenueMap.entries()).map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    // 2. Agregação Temporal

    // Diário (Últimos 30 dias)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayTotal = completedAppointments
            .filter(apt => isSameDay(new Date(apt.date), date))
            .reduce((acc, curr) => acc + Number(curr.service.price), 0);

        dailyData.push({
            name: format(date, "dd/MM"),
            total: dayTotal
        });
    }

    // Semanal (Últimas 8 semanas)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
        const date = subWeeks(new Date(), i);
        const start = startOfWeek(date, { weekStartsOn: 0 }); // Domingo
        const end = endOfWeek(date, { weekStartsOn: 0 });

        const weekTotal = completedAppointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= start && aptDate <= end;
            })
            .reduce((acc, curr) => acc + Number(curr.service.price), 0);

        weeklyData.push({
            name: `Sem ${format(start, "dd/MM")}`,
            total: weekTotal
        });
    }

    // Mensal (Últimos 12 meses)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const monthTotal = completedAppointments
            .filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate >= start && aptDate <= end;
            })
            .reduce((acc, curr) => acc + Number(curr.service.price), 0);

        monthlyData.push({
            name: format(date, "MMM", { locale: ptBR }).toUpperCase(),
            total: monthTotal
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Financeiro</h2>
            </div>

            <div className="grid gap-4 grid-cols-1">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium text-zinc-400">Receita Total Acumulada</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold text-emerald-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                        <p className="text-sm text-zinc-400 mt-2">
                            +100% em relação ao início (Todo o período)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TimeRevenueChart
                    dailyData={dailyData}
                    weeklyData={weeklyData}
                    monthlyData={monthlyData}
                />
                <ServiceRevenueChart data={serviceRevenueData} />
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle>Histórico de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableHead className="text-zinc-400">Cliente</TableHead>
                                <TableHead className="text-zinc-400">Serviço</TableHead>
                                <TableHead className="text-zinc-400">Data</TableHead>
                                <TableHead className="text-zinc-400">Valor</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedAppointments.map((apt) => (
                                <TableRow key={apt.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium">{apt.user.name}</TableCell>
                                    <TableCell>{apt.service.name}</TableCell>
                                    <TableCell>
                                        {format(new Date(apt.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(apt.service.price))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                            Concluído
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {completedAppointments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                                        Nenhuma transação encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
