import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barber SaaS",
  description: "Sistema de gestão para barbearias",
};

import { getSettings } from "./settings-actions";
import { Providers } from "@/components/providers";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const session = await auth();

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers
          session={session}
          themeProps={{
            initialPrimary: settings?.primaryColor || "#fbbf24",
            initialSecondary: settings?.secondaryColor || "#18181b",
          }}
        >
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
