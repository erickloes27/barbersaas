"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Scissors, Zap, Crown, User, Star } from "lucide-react";
import { createService } from "@/app/actions";
import { toast } from "sonner";

export function AddServiceDialog() {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        const result = await createService(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Serviço criado com sucesso!");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Adicionar Serviço</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Crie um novo serviço para sua barbearia.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-zinc-300">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right text-zinc-300">
                                Preço
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                placeholder="0,00"
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right text-zinc-300">
                                Duração
                            </Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Input
                                    id="duration"
                                    name="duration"
                                    type="number"
                                    placeholder="30"
                                    className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                                    required
                                />
                                <span className="text-zinc-400 text-sm">min</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="icon" className="text-right text-zinc-300">
                                Ícone
                            </Label>
                            <div className="col-span-3">
                                <Select name="icon" defaultValue="Scissors">
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue placeholder="Selecione um ícone" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="Scissors"><div className="flex items-center gap-2"><Scissors size={16} /> Tesoura</div></SelectItem>
                                        <SelectItem value="Zap"><div className="flex items-center gap-2"><Zap size={16} /> Raio</div></SelectItem>
                                        <SelectItem value="Crown"><div className="flex items-center gap-2"><Crown size={16} /> Coroa</div></SelectItem>
                                        <SelectItem value="User"><div className="flex items-center gap-2"><User size={16} /> Usuário</div></SelectItem>
                                        <SelectItem value="Star"><div className="flex items-center gap-2"><Star size={16} /> Estrela</div></SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="order" className="text-right text-zinc-300">
                                Ordem
                            </Label>
                            <Input
                                id="order"
                                name="order"
                                type="number"
                                defaultValue="0"
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right text-zinc-300">
                                Descrição
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400">
                            Salvar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
