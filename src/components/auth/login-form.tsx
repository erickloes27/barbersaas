"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithCredentials } from "@/app/actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-11 mt-6"
            disabled={pending}
        >
            {pending ? "Entrando..." : "Entrar"}
        </Button>
    );
}

export function LoginForm() {
    const [state, formAction] = useActionState(loginWithCredentials, null);
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            toast.success("Conta criada com sucesso! Faça login para continuar.");
        }
    }, [searchParams]);

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                    {state.error}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">
                    Email
                </Label>
                <Input
                    id="email"
                    name="email"
                    placeholder="seu@email.com"
                    type="email"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500"
                    required
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-300">
                        Senha
                    </Label>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-yellow-500 hover:text-yellow-400"
                    >
                        Esqueceu a senha?
                    </Link>
                </div>
                <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-yellow-500"
                    required
                />
            </div>

            <SubmitButton />
        </form>
    );
}
