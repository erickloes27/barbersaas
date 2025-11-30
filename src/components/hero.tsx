"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface HeroProps {
    slides: {
        id: string;
        title: string;
        subtitle: string | null;
        ctaText: string;
        ctaLink: string;
        imageUrl: string;
    }[];
}

export function Hero({ slides }: HeroProps) {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    // Fallback se não houver slides cadastrados
    const displaySlides = slides.length > 0 ? slides : [
        {
            id: "default",
            title: "Bem-vindo à Barber SaaS",
            subtitle: "Configure seus slides no painel administrativo.",
            ctaText: "Acessar Painel",
            ctaLink: "/login",
            imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop"
        }
    ];

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent className="h-full ml-0">
                    {displaySlides.map((slide, index) => (
                        <CarouselItem key={slide.id || index} className="pl-0 h-full relative">
                            {/* Background Image with Overlay */}
                            {/* Background Image with Overlay */}
                            <div className="absolute inset-0">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="relative h-full container mx-auto px-4 flex flex-col justify-center pt-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="max-w-2xl space-y-6 md:ml-24 lg:ml-32"
                                >
                                    <h2 className="text-yellow-500 font-bold tracking-wider uppercase text-sm md:text-base">
                                        Bem-vindo à Barber SaaS
                                    </h2>
                                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl text-zinc-300 max-w-lg">
                                        {slide.subtitle}
                                    </p>
                                    <div className="flex gap-4 pt-4">
                                        <Link href={slide.ctaLink}>
                                            <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-lg px-8 h-14">
                                                {slide.ctaText}
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                    <CarouselPrevious className="static translate-y-0 bg-black/50 border-white/10 text-white hover:bg-yellow-500 hover:text-black" />
                    <CarouselNext className="static translate-y-0 bg-black/50 border-white/10 text-white hover:bg-yellow-500 hover:text-black" />
                </div>
            </Carousel>
        </section>
    );
}

