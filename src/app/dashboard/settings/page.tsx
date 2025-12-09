import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/actions/settings";
import { auth } from "@/auth";
import { Bell, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingsForm } from "@/components/dashboard/settings-form";

interface SettingsPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
    const session = await auth();
    const userRole = session?.user?.role;
    const { barbershopId } = await searchParams;

    if (userRole === "USER") {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Minhas Configurações</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-yellow-500" />
                                Segurança
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Gerencie sua senha e acesso.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Senha Atual</Label>
                                <Input id="current_password" type="password" className="bg-zinc-800 border-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_password">Nova Senha</Label>
                                <Input id="new_password" type="password" className="bg-zinc-800 border-zinc-700" />
                            </div>
                            <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                                Atualizar Senha
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-500" />
                                Notificações
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Escolha como deseja ser avisado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Lembretes de Agendamento</Label>
                                    <p className="text-sm text-zinc-400">Receber lembrete 1h antes.</p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-zinc-700" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Promoções</Label>
                                    <p className="text-sm text-zinc-400">Receber ofertas exclusivas.</p>
                                </div>
                                <Switch className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-zinc-700" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Marketing</Label>
                                    <p className="text-sm text-zinc-400">Novidades da barbearia.</p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-zinc-700" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // --- ADMIN VIEW ---
    const settings = await getSettings();

    if (!settings) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Configurações da Barbearia</h2>
                </div>
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="pt-6">
                        <p className="text-zinc-400">Nenhuma barbearia vinculada a este usuário.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Configurações da Barbearia</h2>
            </div>
            <SettingsForm settings={settings} />
        </div>
    );
}
