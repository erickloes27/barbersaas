"use client";

import { useState, useRef } from "react";
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
import { Pencil, Camera } from "lucide-react";
import { updateBarber } from "@/app/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Barber {
    id: string;
    name: string;
    bio: string | null;
    instagram: string | null;
    imageUrl: string | null;
}

export function EditBarberDialog({ barber }: { barber: Barber }) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(barber.imageUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    async function handleSubmit(formData: FormData) {
        const result = await updateBarber(barber.id, formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Barbeiro atualizado com sucesso!");
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
                    <DialogTitle>Editar Barbeiro</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Faça alterações no cadastro do barbeiro.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center space-y-4 mb-2">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-24 w-24 border-2 border-zinc-700 group-hover:opacity-75 transition-opacity">
                                    <AvatarImage src={preview || ""} className="object-cover" />
                                    <AvatarFallback className="bg-zinc-800 text-2xl text-white">
                                        <Camera className="h-8 w-8 text-zinc-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <p className="text-xs text-zinc-500">Clique para alterar foto</p>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-zinc-300">
                                Nome
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={barber.name}
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="instagram" className="text-right text-zinc-300">
                                Instagram
                            </Label>
                            <Input
                                id="instagram"
                                name="instagram"
                                defaultValue={barber.instagram || ""}
                                placeholder="@usuario"
                                className="col-span-3 bg-zinc-800 border-zinc-700 text-white focus-visible:ring-yellow-500"
                            />
                        </div>
                        {/* Campo oculto ou removido para URL manual */}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="bio" className="text-right text-zinc-300">
                                Bio
                            </Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={barber.bio || ""}
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
