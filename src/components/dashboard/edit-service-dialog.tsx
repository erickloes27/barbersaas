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
import { Pencil, Scissors, Zap, Crown, User, Star } from "lucide-react";
import { updateService } from "@/app/actions";
import { toast } from "sonner";

interface Service {
    id: string;
    name: string;
    description: string | null;
    price: any;
    duration: number;
    icon: string | null;
    order: number;
}

export function EditServiceDialog({ service }: { service: Service }) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        const result = await updateService(service.id, formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Serviço atualizado com sucesso!");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10 h-8 w-8">
                    <Pencil size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Editar Serviço</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Faça alterações no serviço.
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
                                defaultValue={service.name}
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
                                defaultValue={Number(service.price).toFixed(2).replace(".", ",")}
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
                                    defaultValue={service.duration}
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
                                <Select name="icon" defaultValue={service.icon || "Scissors"}>
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
                                defaultValue={service.order}
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
                                defaultValue={service.description || ""}
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400">
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
