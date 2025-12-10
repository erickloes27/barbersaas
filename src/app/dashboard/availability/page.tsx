import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

export default async function AvailabilityPage() {
    const session = await auth();
    const userRole = session?.user?.role;

    if (userRole !== "ADMIN" && userRole !== "MASTER") {
        return <div>Não autorizado</div>;
    }

    if (!session?.user) {
        return <div>Não autorizado</div>;
    }

    let barbershopId = session.user.barbershopId;

    if (userRole === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId && session.user.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId as string;
    }

    if (!barbershopId) {
        return <div>Barbearia não encontrada</div>;
    }

    const barbers = await prisma.barber.findMany({
        where: { barbershopId },
        orderBy: { name: "asc" }
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Disponibilidade da Equipe</h2>
                <p className="text-zinc-400">Gerencie os horários de trabalho de cada barbeiro.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barbers.map((barber) => (
                    <Card key={barber.id} className="bg-zinc-900 border-zinc-800 text-white hover:border-yellow-500/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium">
                                {barber.name}
                            </CardTitle>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={barber.imageUrl || undefined} />
                                <AvatarFallback>{barber.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center text-sm text-zinc-400">
                                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                    Configurar Horários
                                </div>
                                <Button variant="ghost" size="sm" asChild className="hover:bg-yellow-500 hover:text-black">
                                    <Link href={`/dashboard/availability/${barber.id}`}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {barbers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        Nenhum barbeiro cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
}
