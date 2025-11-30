"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, LayoutDashboard, Calendar, Users, Scissors, Settings, User } from "lucide-react";
import { logout } from "@/app/actions";
import { getSettings } from "@/app/settings-actions";

interface SidebarProps {
    userRole: string;
    barbershopName?: string | null;
    barbershopLogo?: string | null;
}

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Agendamentos",
        icon: Calendar,
        href: "/dashboard/appointments",
        color: "text-violet-500",
    },
    {
        label: "Clientes",
        icon: Users,
        href: "/dashboard/clients",
        color: "text-pink-700",
    },
    {
        label: "Serviços",
        icon: Scissors,
        href: "/dashboard/services",
        color: "text-orange-700",
    },
    {
        label: "Perfil",
        icon: User,
        href: "/dashboard/profile",
        color: "text-emerald-500",
    },
    {
        label: "Configurações",
        icon: Settings,
        href: "/dashboard/settings",
        color: "text-gray-500",
    },
];

export function Sidebar({ userRole, barbershopName, barbershopLogo }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const barbershopId = searchParams.get("barbershopId");

    const [currentName, setCurrentName] = useState(barbershopName);
    const [currentLogo, setCurrentLogo] = useState(barbershopLogo);

    useEffect(() => {
        async function fetchSettings() {
            if (userRole === "MASTER" && barbershopId) {
                const settings = await getSettings(barbershopId);
                if (settings) {
                    setCurrentName(settings.name);
                    setCurrentLogo(settings.logoUrl);
                }
            } else {
                setCurrentName(barbershopName);
                setCurrentLogo(barbershopLogo);
            }
        }
        fetchSettings();
    }, [barbershopId, userRole, barbershopName, barbershopLogo]);

    const filteredRoutes = routes.filter(route => {
        if (userRole === "USER") {
            return ["/dashboard", "/dashboard/appointments", "/dashboard/profile", "/dashboard/settings"].includes(route.href);
        }
        return true;
    });

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white border-r border-zinc-800">
            <div className="px-3 py-2 flex-1">
                <Link
                    href={userRole === "MASTER" && barbershopId ? `/dashboard?barbershopId=${barbershopId}` : "/dashboard"}
                    className="flex items-center pl-3 mb-14 gap-3"
                >
                    {currentLogo ? (
                        <div className="h-10 w-10 rounded-lg overflow-hidden relative border border-zinc-700">
                            <img src={currentLogo} alt="Logo" className="object-cover h-full w-full" />
                        </div>
                    ) : null}
                    <h1 className="text-xl font-bold truncate">
                        {currentName || (
                            <>Barber<span className="text-yellow-500">SaaS</span></>
                        )}
                    </h1>
                </Link>
                <div className="space-y-1">
                    {filteredRoutes.map((route) => {
                        const href = (userRole === "MASTER" && barbershopId)
                            ? `${route.href}?barbershopId=${barbershopId}`
                            : route.href;

                        return (
                            <Link
                                key={route.href}
                                href={href}
                                className={cn(
                                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                    pathname === route.href
                                        ? "text-white bg-white/10"
                                        : "text-zinc-400"
                                )}
                            >
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                    {route.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="px-3 py-2 space-y-2">
                {userRole === "MASTER" && (
                    <Button variant="outline" className="w-full justify-start text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black" asChild>
                        <Link href="/master">
                            <ArrowLeft className="h-5 w-5 mr-3" />
                            Voltar para Master
                        </Link>
                    </Button>
                )}
                <form action={logout}>
                    <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Sair
                    </Button>
                </form>
            </div>
        </div>
    );
}
