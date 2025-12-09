import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Instagram } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteBarber } from "@/actions/barber";
import { AddBarberDialog } from "@/components/dashboard/add-barber-dialog";
import { FormDeleteButton } from "@/components/ui/form-delete-button";
import { EditBarberDialog } from "@/components/dashboard/edit-barber-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { auth } from "@/auth";

interface BarbersPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function BarbersPage({ searchParams }: BarbersPageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const { barbershopId: paramBarbershopId } = await searchParams;

    let targetBarbershopId: string | undefined;

    if (userRole === "MASTER" && paramBarbershopId) {
        targetBarbershopId = paramBarbershopId;
    } else {
        // Vamos manter consistente com o Dashboard: ADMIN usa sessão.
        targetBarbershopId = session?.user?.barbershopId || undefined;

        if (!targetBarbershopId && session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { barbershopId: true }
            });
            targetBarbershopId = user?.barbershopId || undefined;
        }
    }

    const whereClause = targetBarbershopId ? { barbershopId: targetBarbershopId } : {};

    const barbers = await prisma.barber.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Barbeiros</h2>
                <AddBarberDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barbers.map((barber) => (
                    <Card key={barber.id} className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-zinc-700">
                                    <AvatarImage src={barber.imageUrl || ""} alt={barber.name} />
                                    <AvatarFallback className="bg-zinc-800 text-white">
                                        {barber.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg font-bold">
                                    {barber.name}
                                </CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <EditBarberDialog barber={barber} />
                                <FormDeleteButton action={deleteBarber} id={barber.id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {barber.instagram && (
                                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                    <Instagram size={14} />
                                    <span>{barber.instagram}</span>
                                </div>
                            )}
                            {barber.bio && (
                                <p className="text-xs text-zinc-500 mt-2 line-clamp-3">
                                    {barber.bio}
                                </p>
                            )}
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
