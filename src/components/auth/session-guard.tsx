"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        console.log("SessionGuard Status:", status, "Session:", session);
        if (status === "unauthenticated") {
            console.log("Redirecting to login...");
            router.push("/login");
        }
    }, [status, router, session]);

    // Opcional: Monitorar visibilidade da aba para forçar revalidação
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                // Ao voltar para a aba, se o status for authenticated, 
                // o useSession já deve tentar revalidar se configurado, 
                // mas podemos forçar um reload suave se necessário ou confiar no polling.
                // O SessionProvider do next-auth já tem refetchOnWindowFocus=true por padrão.
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, []);

    return <>{children}</>;
}
