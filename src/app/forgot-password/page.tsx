"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/app/actions";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-11"
            disabled={pending}
        >
            {pending ? "Enviando..." : "Enviar Código"}
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(forgotPassword, null);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-zinc-800 text-yellow-500 p-3 rounded-xl mb-4">
                        <Mail size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Recuperar Senha</h2>
                    <p className="mt-2 text-zinc-400 text-sm">
                        Digite seu e-mail para receber um código de verificação.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    {state?.error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-500">
                            {state.success}
                            <div className="mt-2">
                                <Link href="/auth/reset-password" className="font-bold underline">
                                    Ir para redefinição de senha
                                </Link>
                            </div>
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
                            className="bg-black border-zinc-700 text-white focus-visible:ring-yellow-500"
                            required
                        />
                    </div>

                    <SubmitButton />
                </form>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
}
