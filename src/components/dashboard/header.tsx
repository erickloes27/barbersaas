import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { logout } from "@/actions/auth";

interface HeaderProps {
    barbershopName?: string;
    barbershopLogo?: string | null;
    barbershopSlug?: string | null;
}

export async function Header({ barbershopName: propName, barbershopLogo: propLogo, barbershopSlug: propSlug }: HeaderProps) {
    const session = await auth();
    let user = session?.user;

    if (user?.email) {
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
        });
        if (dbUser) {
            user = { ...user, ...dbUser };
        }
    }

    let barbershopName = propName;
    let barbershopLogo = propLogo;
    let barbershopSlug = propSlug;

    if (!barbershopName && user?.barbershopId) {
        const barbershop = await prisma.barbershop.findUnique({
            where: { id: user.barbershopId },
            select: { name: true, logoUrl: true, slug: true }
        });
        barbershopName = barbershop?.name;
        barbershopLogo = barbershop?.logoUrl;
        barbershopSlug = barbershop?.slug;
    }

    return (
        <div className="flex items-center p-4 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden text-white">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-zinc-900 border-zinc-800 w-72">
                    <Sidebar
                        userRole={user?.role || "USER"}
                        barbershopName={barbershopName}
                        barbershopLogo={barbershopLogo}
                        barbershopSlug={barbershopSlug}
                    />
                </SheetContent>
            </Sheet>

            <div className="flex w-full justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border border-zinc-700">
                                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                                <AvatarFallback className="bg-zinc-800 text-white">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-white" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-zinc-400">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                            <Link href="/dashboard/profile" className="w-full">
                                Perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                            <Link href="/dashboard/settings" className="w-full">
                                Configurações
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer p-0">
                            <form action={logout} className="w-full">
                                <button type="submit" className="w-full text-left px-2 py-1.5 text-red-500 hover:text-red-400">
                                    Sair
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
