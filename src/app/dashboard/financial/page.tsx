import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
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

    const whereClause: any = {};
    if (targetBarbershopId) {
        whereClause.barbershopId = targetBarbershopId;
    } else if (userRole === "ADMIN") {
        whereClause.barbershopId = "invalid";
    }

    // 1. Buscar dados para KPIs e Gráficos (Leve - Apenas campos necessários)
    // Precisamos de todos os concluídos para os gráficos de período
    const completedAppointmentsData = await prisma.appointment.findMany({
        where: {
            ...whereClause,
            status: "COMPLETED"
        },
        select: {
            date: true,
            service: {
                select: {
                    name: true,
                    price: true
                }
            },
            barber: {
                select: {
                    name: true,
                    imageUrl: true
                }
            }
        },
        orderBy: { date: "desc" }
    });

    // 2. Contagens Rápidas (Banco de Dados)
    const [totalCount, cancelledCount] = await Promise.all([
        prisma.appointment.count({ where: whereClause }),
        prisma.appointment.count({ where: { ...whereClause, status: "CANCELLED" } })
    ]);

    // 3. Buscar APENAS os últimos 10 para a tabela (Com detalhes)
    const recentTransactions = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            user: { select: { name: true } }, // Só o nome do usuário
            service: { select: { name: true, price: true } },
            barber: { select: { name: true } }
        },
        orderBy: { date: "desc" },
        take: 10
    });

    // Cálculos em memória (agora com payload muito menor)
    const totalRevenue = completedAppointmentsData.reduce((acc, curr) => {
        return acc + Number(curr.service.price);
    }, 0);

    const averageTicket = completedAppointmentsData.length > 0 ? totalRevenue / completedAppointmentsData.length : 0;
    const cancellationRate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;

    // 1. Agregação por Serviço (Ranking)
    const serviceStats = new Map<string, { name: string, revenue: number, count: number }>();
    completedAppointmentsData.forEach(apt => {
        const current = serviceStats.get(apt.service.name) || { name: apt.service.name, revenue: 0, count: 0 };
        serviceStats.set(apt.service.name, {
            name: apt.service.name,
            revenue: current.revenue + Number(apt.service.price),
            count: current.count + 1
        });
    });

    const topServices = Array.from(serviceStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    const COLORS = ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#78350f"];
    const serviceRevenueData = topServices.map((item, index) => ({
        name: item.name,
        value: item.revenue,
        fill: COLORS[index % COLORS.length]
    }));

    // 2. Agregação por Barbeiro (Ranking)
    const barberStats = new Map<string, { name: string, revenue: number, count: number, imageUrl: string | null }>();
    completedAppointmentsData.forEach(apt => {
        const barberName = apt.barber?.name || "Sem Barbeiro";
        const current = barberStats.get(barberName) || { name: barberName, revenue: 0, count: 0, imageUrl: apt.barber?.imageUrl || null };
        barberStats.set(barberName, {
            name: barberName,
            revenue: current.revenue + Number(apt.service.price),
            count: current.count + 1,
            imageUrl: current.imageUrl
        });
    });

    const topBarbers = Array.from(barberStats.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // 3. Agregação Temporal
    // Diário (Últimos 30 dias)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayTotal = completedAppointmentsData
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

        const weekTotal = completedAppointmentsData
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

        const monthTotal = completedAppointmentsData
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
        <PageContainer>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Financeiro Avançado</h2>
            </div>

            {/* KPIs Principais */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Receita Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Ticket Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-500">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(averageTicket)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Agendamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {completedAppointmentsData.length}
                        </div>
                        <p className="text-xs text-zinc-500">Concluídos</p>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Cancelamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {cancellationRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-zinc-500">{cancelledCount} cancelados</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Serviços */}
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle>Top Serviços (Receita)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topServices.map((service, index) => (
                                <div key={service.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{service.name}</p>
                                            <p className="text-xs text-zinc-500">{service.count} agendamentos</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-500">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Barbeiros */}
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle>Top Barbeiros (Performance)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topBarbers.map((barber, index) => (
                                <div key={barber.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                            {index + 1}
                                        </div>
                                        {barber.imageUrl && (
                                            <img src={barber.imageUrl} alt={barber.name} className="w-8 h-8 rounded-full object-cover" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">{barber.name}</p>
                                            <p className="text-xs text-zinc-500">{barber.count} atendimentos</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-sky-500">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(barber.revenue)}
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                <TableHead className="text-zinc-400">Barbeiro</TableHead>
                                <TableHead className="text-zinc-400">Data</TableHead>
                                <TableHead className="text-zinc-400">Valor</TableHead>
                                <TableHead className="text-zinc-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map((apt) => (
                                <TableRow key={apt.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium">{apt.user.name}</TableCell>
                                    <TableCell>{apt.service.name}</TableCell>
                                    <TableCell>{apt.barber?.name || "-"}</TableCell>
                                    <TableCell>
                                        {format(new Date(apt.date), "dd/MM HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(apt.service.price))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            apt.status === "COMPLETED" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                apt.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                        }>
                                            {apt.status === "COMPLETED" ? "Concluído" : apt.status === "CANCELLED" ? "Cancelado" : "Agendado"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </PageContainer>
    );
}
