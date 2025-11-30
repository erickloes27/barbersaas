"use client";


import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Zap, Crown, User, Star } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const iconMap: any = {
    Scissors: Scissors,
    Zap: Zap,
    Crown: Crown,
    User: User,
    Star: Star,
};

interface ServiceItem {
    id: string;
    name: string;
    description: string | null;
    price: any; // Decimal from Prisma comes as object or string depending on serialization
    duration: number;
    icon: string | null;
}

interface ServicesProps {
    services: ServiceItem[];
}

export function Services({ services }: ServicesProps) {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    return (
        <section id="serviços" className="py-24 bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-yellow-500 font-bold tracking-wider uppercase text-sm">
                        Nossos Serviços
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white">
                        Qualidade & Estilo
                    </h3>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Oferecemos uma experiência completa de barbearia, combinando técnicas tradicionais com o estilo moderno.
                    </p>
                </div>

                <div className="px-12">
                    <Carousel
                        plugins={[plugin.current]}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {services.map((service, index) => {
                                const IconComponent = (service.icon && iconMap[service.icon]) ? iconMap[service.icon] : Scissors;

                                return (
                                    <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                        <div className="h-full">
                                            <Card
                                                className={`bg-zinc-900 border-zinc-800 hover:border-yellow-500/50 transition-all duration-300 group h-full`}
                                            >
                                                <CardHeader>
                                                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-yellow-500 transition-colors">
                                                        <IconComponent className="w-6 h-6 text-white group-hover:text-black transition-colors" />
                                                    </div>
                                                    <CardTitle className="text-white text-xl">{service.name}</CardTitle>
                                                    <CardDescription className="text-zinc-400 mt-2 line-clamp-2">
                                                        {service.description}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className="text-2xl font-bold text-yellow-500">
                                                            {new Intl.NumberFormat("pt-BR", {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }).format(Number(service.price))}
                                                        </span>
                                                        <span className="text-sm text-zinc-500 font-medium bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800">
                                                            {service.duration} min
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-12 bg-zinc-900 border-zinc-800 text-white hover:bg-yellow-500 hover:text-black" />
                        <CarouselNext className="hidden md:flex -right-12 bg-zinc-900 border-zinc-800 text-white hover:bg-yellow-500 hover:text-black" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
