"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter } from "lucide-react";

interface BarberItem {
    id: string;
    name: string;
    bio: string | null;
    imageUrl: string | null;
    instagram: string | null;
}

interface BarbersProps {
    barbers: BarberItem[];
}

export function Barbers({ barbers }: BarbersProps) {
    return (
        <section id="barbeiros" className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-yellow-500 font-bold tracking-wider uppercase text-sm">
                        Nosso Time
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white">
                        Mestres da Navalha
                    </h3>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Profissionais experientes e apaixonados pelo que fazem, prontos para transformar o seu visual.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {barbers.map((barber) => (
                        <div
                            key={barber.id}
                            className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800"
                        >
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={barber.imageUrl || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"}
                                    alt={barber.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <h4 className="text-2xl font-bold text-white">{barber.name}</h4>
                                <p className="text-yellow-500 font-medium">Barbeiro</p>
                                {barber.bio && (
                                    <p className="text-sm text-zinc-300 mt-2 line-clamp-3">{barber.bio}</p>
                                )}
                                <div className="flex gap-4 mt-4">
                                    {barber.instagram && (
                                        <Button size="icon" variant="ghost" className="text-white hover:text-yellow-500 hover:bg-white/10" asChild>
                                            <a href={`https://instagram.com/${barber.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                                <Instagram size={20} />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-zinc-900 group-hover:hidden">
                                <h4 className="text-xl font-bold text-white">{barber.name}</h4>
                                <p className="text-zinc-500">Barbeiro</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
