"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getSchedule, updateSchedule } from "@/actions/schedule";
import { toast } from "sonner";
import { Loader2, Copy, Save, Clock, Coffee, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DaySchedule {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    pauseStart: string | null;
    pauseEnd: string | null;
    active: boolean;
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface BarberAvailabilityPageProps {
    params: Promise<{
        barberId: string;
    }>;
}

export default function BarberAvailabilityPage({ params }: BarberAvailabilityPageProps) {
    const { barberId } = use(params);
    const router = useRouter();
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const [slotDuration, setSlotDuration] = useState(60);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSchedule();
    }, [barberId]);

    async function loadSchedule() {
        try {
            // Pass undefined for barbershopId (it will be inferred) and barberId
            const data = await getSchedule(undefined, barberId);
            setSchedules(data.schedules);
            setSlotDuration(data.slotDuration);
        } catch (error) {
            toast.error("Erro ao carregar horários.");
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate = (index: number, field: keyof DaySchedule, value: any) => {
        const newSchedules = [...schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setSchedules(newSchedules);
    };

    const copyToWeekdays = (sourceIndex: number) => {
        const source = schedules[sourceIndex];
        const newSchedules = schedules.map((day) => {
            if (day.dayOfWeek >= 1 && day.dayOfWeek <= 5 && day.dayOfWeek !== source.dayOfWeek) {
                return {
                    ...day,
                    startTime: source.startTime,
                    endTime: source.endTime,
                    pauseStart: source.pauseStart,
                    pauseEnd: source.pauseEnd,
                    active: source.active,
                };
            }
            return day;
        });
        setSchedules(newSchedules);
        toast.success("Horários copiados para dias úteis (Seg-Sex)!");
    };

    const copyToAll = (sourceIndex: number) => {
        const source = schedules[sourceIndex];
        const newSchedules = schedules.map((day) => {
            if (day.dayOfWeek !== source.dayOfWeek) {
                return {
                    ...day,
                    startTime: source.startTime,
                    endTime: source.endTime,
                    pauseStart: source.pauseStart,
                    pauseEnd: source.pauseEnd,
                    active: source.active,
                };
            }
            return day;
        });
        setSchedules(newSchedules);
        toast.success("Horários copiados para todos os dias!");
    };

    async function handleSave() {
        setSaving(true);
        // Pass undefined for barbershopId and barberId
        const result = await updateSchedule(schedules, slotDuration, undefined, barberId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Horários do barbeiro salvos com sucesso!");
            router.refresh();
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-yellow-500 text-zinc-400" asChild>
                        <Link href="/dashboard/availability">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para Lista
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Clock className="text-yellow-500" />
                        Horários do Barbeiro
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Defina os horários específicos de atendimento para este profissional.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8 shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all hover:scale-105"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>

            <div className="grid gap-6">
                {schedules.map((day, index) => (
                    <Card
                        key={day.dayOfWeek}
                        className={cn(
                            "bg-zinc-900/50 border-zinc-800 transition-all duration-300",
                            day.active ? "border-l-4 border-l-yellow-500 shadow-lg" : "opacity-60 grayscale border-l-4 border-l-zinc-700"
                        )}
                    >
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                {/* Day Toggle */}
                                <div className="min-w-[180px] flex items-center gap-4">
                                    <Switch
                                        checked={day.active}
                                        onCheckedChange={(checked) => handleUpdate(index, "active", checked)}
                                        className="data-[state=checked]:bg-yellow-500"
                                    />
                                    <div>
                                        <span className={cn("text-lg font-bold block", day.active ? "text-white" : "text-zinc-500")}>
                                            {DAYS[day.dayOfWeek]}
                                        </span>
                                        <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">
                                            {day.active ? "Disponível" : "Indisponível"}
                                        </span>
                                    </div>
                                </div>

                                {/* Time Inputs */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400 flex items-center gap-2">
                                            <Clock size={12} /> Início
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                value={day.startTime}
                                                onChange={(e) => handleUpdate(index, "startTime", e.target.value)}
                                                disabled={!day.active}
                                                className="bg-black/40 border-zinc-800 text-white h-10 font-mono text-center focus:border-yellow-500 focus:ring-yellow-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400 flex items-center gap-2">
                                            <Clock size={12} /> Fim
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                value={day.endTime}
                                                onChange={(e) => handleUpdate(index, "endTime", e.target.value)}
                                                disabled={!day.active}
                                                className="bg-black/40 border-zinc-800 text-white h-10 font-mono text-center focus:border-yellow-500 focus:ring-yellow-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400 flex items-center gap-2">
                                            <Coffee size={12} /> Início Pausa
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                value={day.pauseStart || ""}
                                                onChange={(e) => handleUpdate(index, "pauseStart", e.target.value)}
                                                disabled={!day.active}
                                                className="bg-black/40 border-zinc-800 text-white h-10 font-mono text-center focus:border-yellow-500 focus:ring-yellow-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-zinc-400 flex items-center gap-2">
                                            <Coffee size={12} /> Fim Pausa
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                type="time"
                                                value={day.pauseEnd || ""}
                                                onChange={(e) => handleUpdate(index, "pauseEnd", e.target.value)}
                                                disabled={!day.active}
                                                className="bg-black/40 border-zinc-800 text-white h-10 font-mono text-center focus:border-yellow-500 focus:ring-yellow-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 min-w-[140px] justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToWeekdays(index)}
                                        title="Copiar para Seg-Sex"
                                        className="text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                                        disabled={!day.active}
                                    >
                                        <span className="text-xs font-medium">Copiar Úteis</span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToAll(index)}
                                        title="Copiar para todos"
                                        className="text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/10"
                                        disabled={!day.active}
                                    >
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
