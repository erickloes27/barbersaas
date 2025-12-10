"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { validateCPF } from "@/lib/utils";

export async function loginWithGoogle() {
    await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithCredentials(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Credenciais inválidas." };
                default:
                    return { error: "Algo deu errado." };
            }
        }
        // Re-throw Next.js redirects
        if ((error as any).message === "NEXT_REDIRECT" || (error as any).digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }
        console.error("Login error:", error);
        return { error: "Erro interno do sistema. Verifique os logs." };
    }
}

export async function logout() {
    // Limpa o cache de todas as rotas
    // revalidatePath("/"); // removido pois signOut já deve lidar com isso, mas vamos forçar se necessário
    await signOut({ redirectTo: "/login" });
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email é obrigatório." };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log(`[ForgotPassword] Email não encontrado: ${email}`);
        return { success: "Se o email existir, um código foi enviado." };
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

    await prisma.verificationToken.deleteMany({
        where: { identifier: email }
    });

    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires
        }
    });

    await sendPasswordResetEmail(email, token);

    return { success: "Se o email existir, um código foi enviado." };
}

export async function resetPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;
    const password = formData.get("password") as string;

    if (!email || !code || !password) {
        return { error: "Todos os campos são obrigatórios." };
    }

    if (password.length < 6) {
        return { error: "A senha deve ter no mínimo 6 caracteres." };
    }

    const verificationToken = await prisma.verificationToken.findFirst({
        where: {
            identifier: email,
            token: code,
            expires: { gt: new Date() }
        }
    });

    if (!verificationToken) {
        return { error: "Código inválido ou expirado." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: email,
                token: code
            }
        }
    });

    return { success: "Senha alterada com sucesso! Você pode fazer login agora." };
}

const registerSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    cpf: z.string().min(11, "CPF inválido").refine((cpf) => validateCPF(cpf), {
        message: "CPF inválido",
    }),
    birthDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Data inválida",
    }),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export async function registerUser(prevState: any, formData: FormData) {
    const data = {
        name: formData.get("name") as string,
        cpf: formData.get("cpf") as string,
        birthDate: formData.get("birthDate") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const validated = registerSchema.safeParse(data);

    if (!validated.success) {
        console.log("Validation failed:", JSON.stringify(validated.error.flatten(), null, 2));
        const fieldErrors = validated.error.flatten().fieldErrors;
        const errorMessage = Object.values(fieldErrors).flat()[0] || "Erro de validação desconhecido.";
        return { error: errorMessage };
    }

    const { name, cpf, birthDate, email, password } = validated.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "Este email já está em uso." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                name,
                cpf,
                birthDate: new Date(birthDate),
                email,
                password: hashedPassword,
            },
        });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return { error: "Erro ao criar conta. Tente novamente." };
    }

    redirect("/login?registered=true");
}

export async function checkEmailAvailability(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    return !!user;
}
