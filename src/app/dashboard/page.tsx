import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Calendar, Plus, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DashboardPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const { barbershopId: paramBarbershopId } = await searchParams;

    // Determinar qual barbearia mostrar
    let targetBarbershopId: string | undefined;

    if (userRole === "MASTER" && paramBarbershopId) {
        targetBarbershopId = paramBarbershopId;
    } else if (userRole === "ADMIN") {
        // Prioriza o ID da sessão, se não tiver, busca no banco
        targetBarbershopId = session?.user?.barbershopId || undefined;

        if (!targetBarbershopId && session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId || undefined;
        }
    }

    // Se for ADMIN e não tiver targetBarbershopId, significa que ele não tem barbearia vinculada.
    // Nesse caso, whereBarbershop deve forçar um filtro impossível ou vazio?
    // Se deixarmos vazio, ele veria TUDO (Global), o que é perigoso.
    // Vamos forçar um ID inexistente se for ADMIN sem barbearia.

    const whereBarbershop = targetBarbershopId
        ? { barbershopId: targetBarbershopId }
        : (userRole === "ADMIN" ? { barbershopId: "invalid-id" } : {});

    // --- VISÃO DO CLIENTE ---
    if (userRole === "USER") {
        // ... (código existente do cliente)
        const nextAppointment = await prisma.appointment.findFirst({
            where: {
                userId: session?.user?.id,
                date: { gte: new Date() },
                status: { not: "CANCELLED" },
            },
            include: { service: true, barber: true },
            orderBy: { date: "asc" },
        });

        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Olá, {session?.user?.name}</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card de Ação Rápida */}
                    <Link href="/dashboard/book" className="block h-full">
                        <Card className="bg-zinc-900 border-zinc-800 text-white flex flex-col justify-center items-center p-8 text-center space-y-4 hover:border-yellow-500 transition-colors cursor-pointer group h-full">
                            <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                                <Plus size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Novo Agendamento</h3>
                                <p className="text-zinc-400">Escolha o serviço e o horário ideal.</p>
                            </div>
                            <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold pointer-events-none">
                                Agendar Agora
                            </Button>
                        </Card>
                    </Link>

                    {/* Card de Próximo Agendamento */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="text-blue-500" />
                                Próximo Agendamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nextAppointment ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                                        <div>
                                            <p className="text-lg font-bold text-white">{nextAppointment.service.name}</p>
                                            <p className="text-zinc-400">com {nextAppointment.barber?.name || "Barbeiro"}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                            Agendado
                                        </Badge>
                                    </div>
                                    <div className="text-3xl font-bold text-white">
                                        {new Date(nextAppointment.date).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long' })}
                                    </div>
                                    <div className="text-xl text-zinc-300">
                                        às {new Date(nextAppointment.date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <Link href="/dashboard/appointments" className="block w-full mt-4">
                                        <Button variant="secondary" className="w-full bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700">
                                            Ver Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-zinc-500 space-y-2">
                                    <Calendar size={32} className="opacity-20" />
                                    <p>Você não tem agendamentos futuros.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // --- VISÃO DO ADMIN/MASTER ---

    // Se for MASTER sem barbershopId, talvez mostrar visão geral global?
    // Por enquanto, vamos aplicar o filtro. Se whereBarbershop for vazio, pega tudo (Global).

    // 1. Faturamento Total
    const completedAppointments = await prisma.appointment.findMany({
        where: {
            status: "COMPLETED",
            ...whereBarbershop
        },
        include: { service: true },
    });

    const totalRevenue = completedAppointments.reduce((acc, curr) => {
        return acc + Number(curr.service.price);
    }, 0);

    // 2. Novos Clientes (Criados este mês)
    // Nota: Clientes podem não ter barbershopId se forem globais, mas se tiverem, filtramos.
    // Se o sistema for estritamente multi-tenant, User deveria ter barbershopId.
    // Mas User pode ser cliente de várias. Vamos assumir filtro por barbershopId se existir no User.
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ajuste: Count users linked to this barbershop (if filtering)
    // Se User tem barbershopId, ok. Se não, como saber?
    // Por enquanto, vamos contar users que têm agendamento nessa barbearia ou estão vinculados.
    // Simplificação: Count users with role USER created this month (Global count if no filter, or filter by barbershopId if User has it)
    const newClientsCount = await prisma.user.count({
        where: {
            role: "USER",
            createdAt: { gte: startOfMonth },
            ...whereBarbershop
        },
    });

    // 3. Agendamentos Hoje
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const appointmentsTodayCount = await prisma.appointment.count({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            ...whereBarbershop
        },
    });

    // 4. Dados do Gráfico
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('pt-BR', { month: 'short' });
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        const monthAppointments = await prisma.appointment.findMany({
            where: {
                status: "COMPLETED",
                date: {
                    gte: date,
                    lt: nextMonth,
                },
                ...whereBarbershop
            },
            include: { service: true },
        });

        const monthTotal = monthAppointments.reduce((acc, curr) => acc + Number(curr.service.price), 0);

        monthlyRevenue.push({
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            total: monthTotal,
        });
    }

    // 5. Vendas Recentes
    const recentSales = await prisma.appointment.findMany({
        where: {
            status: "COMPLETED",
            ...whereBarbershop
        },
        take: 5,
        orderBy: { date: "desc" },
        include: {
            user: true,
            service: true,
        },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Faturamento Total
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                        </div>
                        <p className="text-xs text-zinc-400">
                            Total acumulado
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Novos Clientes (Mês)
                        </CardTitle>
                        <Users className="h-4 w-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newClientsCount}</div>
                        <p className="text-xs text-zinc-400">
                            Neste mês
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Agendamentos Hoje
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentsTodayCount}</div>
                        <p className="text-xs text-zinc-400">
                            Agendados para hoje
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle>Visão Geral de Receita</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={monthlyRevenue} />
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle>Vendas Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentSales sales={recentSales.map(sale => ({
                            ...sale,
                            service: {
                                ...sale.service,
                                price: Number(sale.service.price)
                            }
                        }))} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
