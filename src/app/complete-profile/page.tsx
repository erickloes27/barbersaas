import { completeProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors } from "lucide-react";

export default function CompleteProfilePage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-xl border border-zinc-800">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-white text-black p-3 rounded-xl mb-4">
                        <Scissors size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Complete seu Perfil</h2>
                    <p className="mt-2 text-zinc-400">
                        Precisamos de mais algumas informações para finalizar seu cadastro.
                    </p>
                </div>

                <form action={completeProfile} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-zinc-300">CPF</Label>
                        <Input
                            id="cpf"
                            name="cpf"
                            placeholder="000.000.000-00"
                            className="bg-black border-zinc-700 text-white focus-visible:ring-yellow-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-zinc-300">WhatsApp / Celular</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="(00) 00000-0000"
                            className="bg-black border-zinc-700 text-white focus-visible:ring-yellow-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-zinc-300">Data de Nascimento</Label>
                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            className="bg-black border-zinc-700 text-white focus-visible:ring-yellow-500"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-12 text-lg">
                        Finalizar Cadastro
                    </Button>
                </form>
            </div>
        </div>
    );
}
