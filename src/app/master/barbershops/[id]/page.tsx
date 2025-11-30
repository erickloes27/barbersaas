import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import { AddAdminDialog } from "./add-admin-dialog";

interface BarbershopDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function BarbershopDetailsPage({ params }: BarbershopDetailsPageProps) {
    const session = await auth();

    if (session?.user?.role !== "MASTER") {
        redirect("/");
    }

    const { id } = await params;

    const barbershop = await prisma.barbershop.findUnique({
        where: { id },
        include: {
            users: {
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!barbershop) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" asChild className="text-zinc-400 hover:text-white">
                        <Link href="/master">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-amber-400">{barbershop.name}</h1>
                        <p className="text-zinc-400">Gerenciar usuários e configurações.</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Usuários Administrativos</CardTitle>
                            <AddAdminDialog barbershopId={barbershop.id} />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {barbershop.users.length === 0 ? (
                                    <p className="text-zinc-500 text-center py-4">Nenhum usuário vinculado.</p>
                                ) : (
                                    barbershop.users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800">
                                            <div>
                                                <p className="font-medium text-white">{user.name || "Sem nome"}</p>
                                                <p className="text-sm text-zinc-400">{user.email}</p>
                                                <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded text-zinc-300 mt-1 inline-block">
                                                    {user.role}
                                                </span>
                                            </div>
                                            {/* TODO: Add delete/edit actions if needed */}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
