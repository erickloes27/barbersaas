import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/actions/user";
import { FormDeleteButton } from "@/components/ui/form-delete-button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { auth } from "@/auth";

interface ClientsPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
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

    const whereClause: any = { role: "USER" };
    if (targetBarbershopId) {
        whereClause.barbershopId = targetBarbershopId;
    } else if (userRole === "ADMIN") {
        whereClause.barbershopId = "invalid";
    }

    const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Clientes</h2>
                {/* Futuro: Barra de busca */}
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                                <TableHead className="text-zinc-400">Nome</TableHead>
                                <TableHead className="text-zinc-400">Email</TableHead>
                                <TableHead className="text-zinc-400">CPF</TableHead>
                                <TableHead className="text-zinc-400">Telefone</TableHead>
                                <TableHead className="text-zinc-400">Cadastro</TableHead>
                                <TableHead className="text-right text-zinc-400">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-zinc-700">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback className="bg-zinc-800 text-xs">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {user.name || "Sem nome"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.cpf || "-"}</TableCell>
                                    <TableCell>{user.phone || "-"}</TableCell>
                                    <TableCell>
                                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <FormDeleteButton action={deleteUser} id={user.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                        Nenhum cliente encontrado.
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
