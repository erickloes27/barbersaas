"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { createBooking, getAvailableSlots } from "@/actions/booking";
import { Scissors, User, Calendar as CalendarIcon, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Service {
    id: string;
    name: string;
    price: number; // Decimal
    duration: number;
}

interface Barber {
    id: string;
    name: string;
    imageUrl: string | null;
}

interface BookingWizardProps {
    services: Service[];
    barbers: Barber[];
}

export function BookingWizard({ services, barbers }: BookingWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Buscar slots quando data ou barbeiro mudam
    useEffect(() => {
        async function fetchSlots() {
            if (selectedBarber && selectedDate) {
                setLoadingSlots(true);
                setAvailableSlots([]);
                setSelectedSlot(null);
                try {
                    const slots = await getAvailableSlots(selectedDate.toISOString(), selectedBarber.id);
                    setAvailableSlots(slots);
                } catch (error) {
                    toast.error("Erro ao buscar horários.");
                } finally {
                    setLoadingSlots(false);
                }
            }
        }
        fetchSlots();
    }, [selectedBarber, selectedDate]);

    async function handleBooking() {
        if (!selectedService || !selectedBarber || !selectedSlot) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("serviceId", selectedService.id);
        formData.append("barberId", selectedBarber.id);
        formData.append("date", selectedSlot);

        const result = await createBooking(formData);

        if (result?.error) {
            toast.error(result.error);
            setIsSubmitting(false);
        } else {
            toast.success("Agendamento confirmado!");
            router.push("/dashboard/appointments");
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Steps Indicator */}
            <div className="flex justify-between mb-8 relative">
                <div className="absolute top-4 left-0 w-full h-1 bg-zinc-800 -z-10 rounded-full" />
                {[
                    { step: 1, label: "Serviço" },
                    { step: 2, label: "Profissional" },
                    { step: 3, label: "Horário" },
                    { step: 4, label: "Confirmar" }
                ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center gap-2 bg-black px-2">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors bg-zinc-900",
                                step >= s.step ? "border-yellow-500 text-yellow-500" : "border-zinc-700 text-zinc-500"
                            )}
                        >
                            {s.step}
                        </div>
                        <span className={cn(
                            "text-xs font-medium transition-colors",
                            step >= s.step ? "text-yellow-500" : "text-zinc-600"
                        )}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {/* STEP 1: SELECT SERVICE */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Escolha o Serviço</h2>
                            <Button
                                disabled={!selectedService}
                                onClick={() => setStep(2)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-6"
                            >
                                Próximo
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <Card
                                    key={service.id}
                                    className={cn(
                                        "cursor-pointer hover:border-yellow-500 transition-all bg-zinc-900 border-zinc-800",
                                        selectedService?.id === service.id ? "border-yellow-500 bg-yellow-500/10" : ""
                                    )}
                                    onClick={() => setSelectedService(service)}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-zinc-800 text-yellow-500">
                                                <Scissors size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{service.name}</h3>
                                                <p className="text-zinc-400 text-sm">{service.duration} min</p>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold text-white">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(service.price))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button
                                disabled={!selectedService}
                                onClick={() => setStep(2)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8"
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SELECT BARBER */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400">Voltar</Button>
                            <h2 className="text-2xl font-bold text-white">Escolha o Profissional</h2>
                            <Button
                                disabled={!selectedBarber}
                                onClick={() => setStep(3)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-6"
                            >
                                Próximo
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {barbers.map((barber) => (
                                <Card
                                    key={barber.id}
                                    className={cn(
                                        "cursor-pointer hover:border-yellow-500 transition-all bg-zinc-900 border-zinc-800",
                                        selectedBarber?.id === barber.id ? "border-yellow-500 bg-yellow-500/10" : ""
                                    )}
                                    onClick={() => setSelectedBarber(barber)}
                                >
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-700">
                                            {barber.imageUrl ? (
                                                <img src={barber.imageUrl} alt={barber.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-white text-lg">{barber.name}</h3>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400">Voltar</Button>
                            <Button
                                disabled={!selectedBarber}
                                onClick={() => setStep(3)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8"
                            >
                                Próximo
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SELECT DATE & TIME */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(2)} className="text-zinc-400">Voltar</Button>
                            <h2 className="text-2xl font-bold text-white">Escolha o Horário</h2>
                            <Button
                                disabled={!selectedSlot}
                                onClick={() => setStep(4)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-6"
                            >
                                Revisar
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border-zinc-800 text-white"
                                    disabled={(date: Date) => date.getTime() < new Date().setHours(0, 0, 0, 0)}
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <Clock size={18} className="text-yellow-500" />
                                    Horários Disponíveis
                                </h3>
                                {loadingSlots ? (
                                    <div className="text-zinc-500 text-center py-8">Carregando horários...</div>
                                ) : availableSlots.length === 0 ? (
                                    <div className="text-zinc-500 text-center py-8 border border-dashed border-zinc-800 rounded-lg">
                                        Nenhum horário disponível para esta data.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-3">
                                        {availableSlots.map((slot) => {
                                            const timeString = new Date(slot).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <Button
                                                    key={slot}
                                                    variant="outline"
                                                    className={cn(
                                                        "border-zinc-700 bg-zinc-800 text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all",
                                                        selectedSlot === slot ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]" : ""
                                                    )}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {timeString}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setStep(2)} className="text-zinc-400">Voltar</Button>
                            <Button
                                disabled={!selectedSlot}
                                onClick={() => setStep(4)}
                                className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold px-8"
                            >
                                Revisar
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: CONFIRM */}
                {step === 4 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(3)} className="text-zinc-400">Voltar</Button>
                            <h2 className="text-2xl font-bold text-white">Confirmar</h2>
                            <Button
                                onClick={handleBooking}
                                disabled={isSubmitting}
                                className="bg-green-500 text-white hover:bg-green-600 font-bold px-6"
                            >
                                {isSubmitting ? "..." : "Confirmar"}
                            </Button>
                        </div>
                        <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto">
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
                                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                                        <CheckCircle size={32} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Quase lá!</h3>
                                        <p className="text-zinc-400 text-sm">Confira os detalhes abaixo.</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Serviço:</span>
                                        <span className="text-white font-medium">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Profissional:</span>
                                        <span className="text-white font-medium">{selectedBarber?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Data:</span>
                                        <span className="text-white font-medium">
                                            {selectedDate?.toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Horário:</span>
                                        <span className="text-white font-medium">
                                            {selectedSlot && new Date(selectedSlot).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-4 border-t border-zinc-800 text-lg font-bold">
                                        <span className="text-white">Total:</span>
                                        <span className="text-yellow-500">
                                            {selectedService && new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(selectedService.price))}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-between pt-4 max-w-md mx-auto">
                            <Button variant="ghost" onClick={() => setStep(3)} className="text-zinc-400">Voltar</Button>
                            <Button
                                onClick={handleBooking}
                                disabled={isSubmitting}
                                className="bg-green-500 text-white hover:bg-green-600 font-bold px-8 w-1/2"
                            >
                                {isSubmitting ? "Confirmando..." : "Confirmar Agendamento"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
