import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteService } from "@/actions/service";
import { AddServiceDialog } from "@/components/dashboard/add-service-dialog";
import { FormDeleteButton } from "@/components/ui/form-delete-button";
import { EditServiceDialog } from "@/components/dashboard/edit-service-dialog";

import { auth } from "@/auth";

interface ServicesPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
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

    const whereClause = targetBarbershopId ? { barbershopId: targetBarbershopId } : {};

    const services = await prisma.service.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            icon: true,
            order: true,
        },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Serviços</h2>
                <AddServiceDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                    <Card key={service.id} className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">
                                {service.name}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <EditServiceDialog service={service} />
                                <FormDeleteButton action={deleteService} id={service.id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-500">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(Number(service.price))}
                            </div>
                            <p className="text-sm text-zinc-400 mt-1">
                                {service.duration} minutos
                            </p>
                            {service.description && (
                                <p className="text-xs text-zinc-500 mt-4 line-clamp-2">
                                    {service.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {services.length === 0 && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        Nenhum serviço cadastrado.
                    </div>
                )}
            </div>
        </div>
    );
}
