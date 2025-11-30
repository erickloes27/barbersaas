import Link from "next/link";
import { Scissors, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { loginWithGoogle } from "@/app/actions";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-black">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center">
                        <Link href="/" className="flex items-center gap-2 group mb-8">
                            <div className="bg-white text-black p-2 rounded-lg group-hover:bg-yellow-500 transition-colors">
                                <Scissors size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tighter">
                                Barber<span className="text-yellow-500">SaaS</span>
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            Bem-vindo de volta
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Entre com suas credenciais para acessar o painel.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="mt-8 space-y-6">
                        <LoginForm />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="bg-zinc-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-2 text-zinc-500">
                                    Ou continue com
                                </span>
                            </div>
                        </div>

                        <form action={loginWithGoogle}>
                            <Button variant="outline" className="w-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900 hover:text-white h-11" type="submit">
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                Entrar com Google
                            </Button>
                        </form>

                        <p className="text-center text-sm text-zinc-400">
                            Não tem uma conta?{" "}
                            <Link href="/register" className="font-medium text-yellow-500 hover:text-yellow-400">
                                Cadastre-se grátis
                            </Link>
                        </p>
                    </div>

                    <div className="pt-8 text-center">
                        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
                            <ArrowLeft size={16} className="mr-2" />
                            Voltar para o início
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block relative bg-zinc-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
                </div>
                <div className="relative h-full flex flex-col justify-end p-12 text-white">
                    <div className="max-w-md space-y-4">
                        <blockquote className="text-2xl font-medium leading-relaxed">
                            "A melhor plataforma de gestão que já usei. Simples, rápida e meus clientes adoram o agendamento online."
                        </blockquote>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-500">
                                MR
                            </div>
                            <div>
                                <div className="font-bold">Marcos Rocha</div>
                                <div className="text-sm text-zinc-400">Dono da Rocha's Barber</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
