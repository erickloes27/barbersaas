"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

interface HeaderProps {
    barbershopName?: string;
    barbershopLogo?: string | null;
}

export function Header({ barbershopName, barbershopLogo }: HeaderProps) {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    {barbershopLogo ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden relative bg-white/10">
                            <img src={barbershopLogo} alt="Logo" className="object-cover h-full w-full" />
                        </div>
                    ) : (
                        <div className="bg-white text-black p-2 rounded-lg group-hover:bg-yellow-500 transition-colors">
                            <Scissors size={24} />
                        </div>
                    )}
                    <span className="text-2xl font-bold text-white tracking-tighter truncate max-w-[200px] md:max-w-none">
                        {barbershopName || (
                            <>Barber<span className="text-yellow-500">SaaS</span></>
                        )}
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {["Serviços", "Barbeiros", "Contato"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-base font-bold text-white hover:text-yellow-500 transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {session?.user?.role === "MASTER" && (
                        <Button variant="outline" className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black" asChild>
                            <Link href="/master">Voltar para Master</Link>
                        </Button>
                    )}
                    <Button variant="ghost" className="text-white hover:text-yellow-500 hover:bg-white/10" asChild>
                        <Link href="/login">Entrar</Link>
                    </Button>
                    <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold" asChild>
                        <Link href="/login">Agendar Agora</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-white">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-zinc-950 border-l border-zinc-800">
                        <div className="flex flex-col h-full px-6">
                            <div className="flex items-center gap-2 mb-8 pt-10">
                                <Scissors className="text-yellow-500" />
                                <span className="text-xl font-bold text-white">BarberSaaS</span>
                            </div>
                            <nav className="flex flex-col gap-6">
                                {["Serviços", "Barbeiros", "Contato"].map((item) => (
                                    <Link
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="text-2xl font-bold text-zinc-400 hover:text-white hover:pl-2 transition-all"
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-auto pb-8 space-y-4">
                                <Button variant="outline" className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800 hover:text-white h-12 text-lg" asChild>
                                    <Link href="/login">Entrar</Link>
                                </Button>
                                <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold h-12 text-lg" asChild>
                                    <Link href="/login">Agendar Agora</Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header >
    );
}
