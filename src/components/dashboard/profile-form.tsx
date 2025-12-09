"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/actions/user";
import { format } from "date-fns";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface User {
    name: string | null;
    email: string | null;
    cpf: string | null;
    phone: string | null;
    birthDate: Date | null;
    image: string | null;
}

export function ProfileForm({ user }: { user: User }) {
    const [preview, setPreview] = useState<string | null>(user.image);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        const result = await updateProfile(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Perfil atualizado com sucesso!");
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-32 w-32 border-4 border-zinc-800 shadow-xl group-hover:opacity-75 transition-opacity">
                        <AvatarImage src={preview || ""} alt={user.name || ""} className="object-cover" />
                        <AvatarFallback className="bg-zinc-800 text-4xl text-white">
                            {user.name?.charAt(0).toUpperCase() || "U"}
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
                <p className="text-sm text-zinc-400">Clique na foto para alterar</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    className="bg-zinc-800 border-zinc-700 text-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    className="bg-zinc-800 border-zinc-700 text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                        id="cpf"
                        name="cpf"
                        defaultValue={user.cpf || ""}
                        className="bg-zinc-800 border-zinc-700 text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                        id="phone"
                        name="phone"
                        defaultValue={user.phone || ""}
                        className="bg-zinc-800 border-zinc-700 text-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={user.birthDate ? format(new Date(user.birthDate), "yyyy-MM-dd") : ""}
                    className="bg-zinc-800 border-zinc-700 text-white"
                />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                Salvar Alterações
            </Button>
        </form>
    );
}
