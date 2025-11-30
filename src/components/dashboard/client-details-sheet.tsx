"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Mail, Phone, User } from "lucide-react";

interface ClientDetailsProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        phone: string | null;
        cpf: string | null;
        createdAt: Date;
    };
    children: React.ReactNode;
}

export function ClientDetailsSheet({ user, children }: ClientDetailsProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md flex flex-col items-center text-center pt-8">
                <SheetHeader className="mb-6 w-full">
                    <SheetTitle className="text-white text-xl">Detalhes do Cliente</SheetTitle>
                    <SheetDescription className="text-zinc-400 text-xs">
                        Informações completas do cadastro.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col items-center mb-6 w-full">
                    <Avatar className="h-24 w-24 border-4 border-yellow-500 mb-4 shadow-lg shadow-yellow-500/20">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-zinc-800 text-2xl">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold mb-1">{user.name || "Sem Nome"}</h3>
                    <p className="text-zinc-400 text-sm">Cliente desde {new Date(user.createdAt).getFullYear()}</p>
                </div>

                <div className="space-y-6 w-full px-4">
                    <div className="space-y-3 bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
                        <h4 className="text-xs font-medium text-yellow-500 uppercase tracking-wider flex items-center justify-center gap-2">
                            <Mail size={12} /> Contato
                        </h4>
                        <div className="space-y-1">
                            <p className="text-zinc-300 text-sm">{user.email}</p>
                            <p className="text-zinc-300 text-sm">{user.phone || "Telefone não informado"}</p>
                        </div>
                    </div>

                    <div className="space-y-3 bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
                        <h4 className="text-xs font-medium text-yellow-500 uppercase tracking-wider flex items-center justify-center gap-2">
                            <User size={12} /> Dados Pessoais
                        </h4>
                        <div className="space-y-1">
                            <p className="text-zinc-300 text-sm">CPF: {user.cpf || "Não informado"}</p>
                            <p className="text-zinc-300 text-sm">Cadastro: {new Date(user.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-10 text-sm">
                            Ver Histórico Completo
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
