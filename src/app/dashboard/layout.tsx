import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionGuard } from "@/components/auth/session-guard";
import { getSettings } from "@/actions/settings";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const userRole = session?.user?.role;
    const settings = await getSettings();

    return (
        <SessionGuard>
            <div className="min-h-screen relative bg-black">
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-zinc-900">
                    <Sidebar
                        userRole={userRole}
                        barbershopName={settings?.name}
                        barbershopLogo={settings?.logoUrl}
                    />
                </div>
                <main className="md:pl-72 min-h-screen">
                    <Header />
                    <div className="p-8 bg-black text-white">
                        {children}
                    </div>
                </main>
            </div>
        </SessionGuard>
    );
}
