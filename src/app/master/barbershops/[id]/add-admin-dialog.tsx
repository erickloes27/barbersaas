"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createAdminUser } from "../../actions";

interface AddAdminDialogProps {
    barbershopId: string;
}

export function AddAdminDialog({ barbershopId }: AddAdminDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Append barbershopId to formData
            formData.append("barbershopId", barbershopId);

            const result = await createAdminUser(formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Administrador criado com sucesso!");
                setOpen(false);
            }
        } catch (error) {
            toast.error("Erro ao criar administrador.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-amber-400 text-black hover:bg-amber-500">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Admin
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Adicionar Administrador</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Nome do usuário"
                            required
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            required
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="******"
                            required
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-amber-400 text-black hover:bg-amber-500" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Usuário"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
