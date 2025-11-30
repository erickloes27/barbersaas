"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

interface ProvidersProps {
    children: React.ReactNode;
    themeProps: {
        initialPrimary: string;
        initialSecondary: string;
    };
    session?: any;
}

export function Providers({ children, themeProps, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            <ThemeProvider
                initialPrimary={themeProps.initialPrimary}
                initialSecondary={themeProps.initialSecondary}
            >
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}
