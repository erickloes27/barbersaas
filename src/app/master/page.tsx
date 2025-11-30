import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export default async function MasterDashboard() {
    const session = await auth();

    if (session?.user?.role !== "MASTER") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                <p className="text-zinc-400">Você não tem permissão para acessar esta página.</p>
                <Button asChild className="mt-4" variant="outline">
                    <Link href="/">Voltar para Home</Link>
                </Button>
            </div>
        );
    }

    const barbershops = await prisma.barbershop.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    users: true,
                    appointments: true,
                }
            }
        }
    });

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-400">Painel Master</h1>
                        <p className="text-zinc-400">Gerencie todas as barbearias da plataforma.</p>
                    </div>
                    <div className="flex gap-4">
                        <form action={logout}>
                            <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                                <LogOut className="w-4 h-4 mr-2" />
                                Sair
                            </Button>
                        </form>
                        <Button asChild className="bg-amber-400 text-black hover:bg-amber-500">
                            <Link href="/master/new">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Nova Barbearia
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {barbershops.map((shop) => (
                        <Card key={shop.id} className="bg-zinc-900 border-zinc-800 text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold flex justify-between items-start">
                                    {shop.name}
                                    <Button size="icon" variant="ghost" asChild className="h-6 w-6 text-zinc-400 hover:text-white">
                                        <Link href={`/${shop.slug}`} target="_blank">
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </CardTitle>
                                <p className="text-sm text-zinc-500">/{shop.slug}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Usuários:</span>
                                        <span className="text-white">{shop._count.users}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Agendamentos:</span>
                                        <span className="text-white">{shop._count.appointments}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-2">
                                        <Button size="sm" className="w-full bg-amber-400 text-black hover:bg-amber-500" asChild>
                                            <Link href={`/dashboard?barbershopId=${shop.id}`}>
                                                Acessar Painel
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" asChild>
                                            <Link href={`/master/barbershops/${shop.id}`}>
                                                Gerenciar Usuários
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
