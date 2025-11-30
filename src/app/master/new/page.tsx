"use client";

import { createBarbershop } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewBarbershopPage() {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await createBarbershop(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Barbearia criada com sucesso!");
            // Redirect handled in server action
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" size="icon" asChild className="text-zinc-400 hover:text-white">
                            <Link href="/master">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <CardTitle>Nova Barbearia</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Barbearia</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Ex: Barbearia do Zé"
                                required
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL (Slug)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500 text-sm">/</span>
                                <Input
                                    id="slug"
                                    name="slug"
                                    placeholder="barbearia-do-ze"
                                    required
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <p className="text-xs text-zinc-500">Apenas letras minúsculas, números e hífens.</p>
                        </div>
                        <Button type="submit" className="w-full bg-amber-400 text-black hover:bg-amber-500">
                            Criar Barbearia
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
