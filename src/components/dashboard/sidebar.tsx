"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, LayoutDashboard, Calendar, Users, Scissors, Settings, User, Image as ImageIcon, Clock, Mail, DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import { logout } from "@/actions/auth";
import { getSettings } from "@/actions/settings";

interface SidebarProps {
    userRole: string;
    barbershopName?: string | null;
    barbershopLogo?: string | null;
    barbershopSlug?: string | null;
}

const routeGroups = [
    {
        label: "Gestão",
        routes: [
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
                label: "Financeiro",
                icon: DollarSign,
                href: "/dashboard/financial",
                color: "text-emerald-600",
            },
        ]
    },
    {
        label: "Operacional",
        routes: [
            {
                label: "Serviços",
                icon: Scissors,
                href: "/dashboard/services",
                color: "text-orange-700",
            },
            {
                label: "Barbeiros",
                icon: User,
                href: "/dashboard/barbers",
                color: "text-indigo-500",
            },
            {
                label: "Horários",
                icon: Clock,
                href: "/dashboard/availability",
                color: "text-green-500",
            },
        ]
    },
    {
        label: "Marketing",
        routes: [
            {
                label: "Marketing",
                icon: Mail,
                href: "/dashboard/marketing",
                color: "text-red-500",
            },
            {
                label: "E-mails",
                icon: Mail,
                href: "/dashboard/settings/email",
                color: "text-blue-500",
            },
            {
                label: "Carrossel",
                icon: ImageIcon,
                href: "/dashboard/settings/carousel",
                color: "text-pink-500",
            },
        ]
    },
    {
        label: "Configurações",
        routes: [
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
        ]
    }
];

export function Sidebar({ userRole, barbershopName, barbershopLogo, barbershopSlug }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const barbershopId = searchParams.get("barbershopId");

    const [currentName, setCurrentName] = useState(barbershopName);
    const [currentLogo, setCurrentLogo] = useState(barbershopLogo);
    const [currentSlug, setCurrentSlug] = useState(barbershopSlug);

    // Initialize with all groups expanded by default, or specific ones
    const [expandedGroups, setExpandedGroups] = useState<string[]>(["Gestão", "Operacional", "Marketing", "Configurações"]);

    const toggleGroup = (label: string) => {
        setExpandedGroups(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    useEffect(() => {
        async function fetchSettings() {
            if (userRole === "MASTER" && barbershopId) {
                const settings = await getSettings(barbershopId);
                if (settings) {
                    setCurrentName(settings.name);
                    setCurrentLogo(settings.logoUrl);
                    setCurrentSlug(settings.slug);
                }
            } else {
                setCurrentName(barbershopName);
                setCurrentLogo(barbershopLogo);
                setCurrentSlug(barbershopSlug);
            }
        }
        fetchSettings();
    }, [barbershopId, userRole, barbershopName, barbershopLogo, barbershopSlug]);

    const filteredGroups = routeGroups.map(group => ({
        ...group,
        routes: group.routes.filter(route => {
            if (userRole === "USER") {
                return ["/dashboard", "/dashboard/appointments", "/dashboard/profile", "/dashboard/settings"].includes(route.href);
            }
            return true;
        })
    })).filter(group => group.routes.length > 0);

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white border-r border-zinc-800">
            <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
                <Link
                    href={currentSlug ? `/${currentSlug}` : (userRole === "MASTER" && barbershopId ? `/dashboard?barbershopId=${barbershopId}` : "/dashboard")}
                    className="flex items-center pl-3 mb-10 gap-3"
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
                <div className="space-y-6">
                    {filteredGroups.map((group, index) => {
                        const isExpanded = expandedGroups.includes(group.label);
                        return (
                            <div key={index}>
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    className="w-full flex items-center justify-between mb-2 px-4 text-xs font-semibold tracking-tight text-zinc-500 uppercase hover:text-zinc-300 transition-colors focus:outline-none"
                                >
                                    {group.label}
                                    {isExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                </button>
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="space-y-1 pt-1">
                                                {group.routes.map((route) => {
                                                    const href = (userRole === "MASTER" && barbershopId)
                                                        ? `${route.href}?barbershopId=${barbershopId}`
                                                        : route.href;

                                                    return (
                                                        <Link
                                                            key={route.href}
                                                            href={href}
                                                            className={cn(
                                                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition",
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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
