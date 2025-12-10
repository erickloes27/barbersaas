import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"

/**
 * Configuração de Autenticação (NextAuth.js v5)
 * 
 * Este arquivo define como os usuários fazem login no sistema.
 * Suportamos:
 * 1. Credenciais (Email e Senha)
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma) as any, // Salva sessões no banco de dados
    session: {
        strategy: "jwt", // Usa JSON Web Tokens para sessão (mais leve)
        maxAge: 30 * 24 * 60 * 60, // Sessão dura 30 dias
    },
    // secret removido pois já existe no authConfig ou será pego de process.env automaticamente
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.barbershopId = user.barbershopId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.barbershopId = token.barbershopId as string;
            }
            return session;
        },
    }
})
