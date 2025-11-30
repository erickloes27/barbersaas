"use server";

import { signIn, signOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/mail";
import { writeFile } from "fs/promises";
import { join } from "path";

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
        throw error;
    }
}

export async function logout() {
    await signOut({ redirectTo: "/login" });
}

const profileSchema = z.object({
    cpf: z.string().min(11, "CPF inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    birthDate: z.string().refine((date) => new Date(date).toString() !== 'Invalid Date', {
        message: "Data inválida",
    }),
});

export async function completeProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const data = {
        cpf: formData.get("cpf") as string,
        phone: formData.get("phone") as string,
        birthDate: formData.get("birthDate") as string,
    };

    const validated = profileSchema.safeParse(data);

    if (!validated.success) {
        throw new Error("Dados inválidos");
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            cpf: validated.data.cpf,
            phone: validated.data.phone,
            birthDate: new Date(validated.data.birthDate),
        },
    });

    redirect("/dashboard");
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return { error: "Email é obrigatório." };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Por segurança, não revelamos se o email existe ou não, mas logamos internamente
    if (!user) {
        console.log(`[ForgotPassword] Email não encontrado: ${email}`);
        return { success: "Se o email existir, um código foi enviado." };
    }

    // Gerar token de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

    // Deletar tokens antigos desse email primeiro para evitar conflito de chave composta
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

    // Enviar email
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

    // Buscar token válido
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

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar usuário
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    // Deletar token usado
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

import { validateCPF } from "@/lib/utils";

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
        // Pega a primeira mensagem de erro de qualquer campo que falhou
        const errorMessage = Object.values(fieldErrors).flat()[0] || "Erro de validação desconhecido.";
        return { error: errorMessage };
    }

    const { name, cpf, birthDate, email, password } = validated.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "Este email já está em uso." };
    }

    // Hash da senha
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
        select: { id: true }, // Select only ID for performance
    });
    return !!user;
}

const serviceSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    price: z.string().transform((val) => parseFloat(val.replace(",", "."))),
    duration: z.string().transform((val) => parseInt(val)),
    icon: z.string().optional(),
    order: z.string().transform((val) => parseInt(val || "0")),
});

import { revalidatePath } from "next/cache";

export async function createService(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    let barbershopId = session.user.barbershopId;

    // Fallback para MASTER: Se não tiver ID, pega a primeira barbearia
    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        // Fallback: Se não tiver na sessão (e não for master resolvido acima), busca no banco
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId as string;
    }

    // Última tentativa para MASTER se ainda for null
    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        return { error: "Barbearia não identificada." };
    }

    const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: formData.get("price") as string,
        duration: formData.get("duration") as string,
        icon: formData.get("icon") as string,
        order: formData.get("order") as string,
    };

    const validated = serviceSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos. Verifique os campos." };
    }

    try {
        await prisma.service.create({
            data: {
                name: validated.data.name,
                description: validated.data.description,
                price: validated.data.price,
                duration: validated.data.duration,
                icon: validated.data.icon,
                order: validated.data.order,
                barbershopId: barbershopId,
            },
        });
        revalidatePath("/dashboard/services");
        revalidatePath("/");
        return { success: "Serviço criado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar serviço:", error);
        return { error: `Erro ao criar serviço: ${(error as Error).message}` };
    }
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({ where: { id } });
        revalidatePath("/dashboard/services");
        return { success: "Serviço removido com sucesso!" };
    } catch (error) {
        return { error: "Erro ao remover serviço." };
    }
}

export async function updateService(id: string, formData: FormData) {
    const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: formData.get("price") as string,
        duration: formData.get("duration") as string,
        icon: formData.get("icon") as string,
        order: formData.get("order") as string,
    };

    // Schema parcial para update ou reutilizar o serviceSchema com campos opcionais se necessário, 
    // mas aqui vou validar tudo pois é um form completo.
    // Preciso atualizar o serviceSchema lá em cima para incluir icon e order.
    // Vou fazer isso em um passo separado ou assumir que vou atualizar o schema agora.
    // Vou atualizar o schema agora na mesma chamada se possível, mas o replace é local.
    // Vou validar manualmente ou criar um schema local aqui para garantir.

    const updateSchema = z.object({
        name: z.string().min(3),
        description: z.string().optional(),
        price: z.string().transform((val) => parseFloat(val.replace(",", "."))),
        duration: z.string().transform((val) => parseInt(val)),
        icon: z.string().optional(),
        order: z.string().transform((val) => parseInt(val)).optional(),
    });

    const validated = updateSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    try {
        await prisma.service.update({
            where: { id },
            data: {
                name: validated.data.name,
                description: validated.data.description,
                price: validated.data.price,
                duration: validated.data.duration,
                icon: validated.data.icon,
                order: validated.data.order,
            },
        });
        revalidatePath("/dashboard/services");
        revalidatePath("/"); // Atualizar a home também
        return { success: "Serviço atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar serviço:", error);
        return { error: "Erro ao atualizar serviço." };
    }
}

const barberSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    bio: z.string().nullish(),
    instagram: z.string().nullish(),
    imageUrl: z.string().nullish(),
});

export async function createBarber(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    let barbershopId = session.user.barbershopId;

    // Fallback para MASTER: Se não tiver ID, pega a primeira barbearia
    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        // Fallback: Se não tiver na sessão (e não for master resolvido acima), busca no banco
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { barbershopId: true }
        });
        barbershopId = user?.barbershopId as string;
    }

    // Última tentativa para MASTER se ainda for null (caso o user no banco tbm não tenha)
    if (session.user.role === "MASTER" && !barbershopId) {
        const first = await prisma.barbershop.findFirst();
        barbershopId = first?.id;
    }

    if (!barbershopId) {
        return { error: "Barbearia não identificada." };
    }

    const imageFile = formData.get("imageFile") as File;
    let imageUrl = formData.get("imageUrl") as string;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const uploadDir = join(process.cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error("Erro ao salvar imagem:", error);
            return { error: "Erro ao salvar imagem do barbeiro." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        instagram: formData.get("instagram") as string,
        imageUrl: imageUrl,
    };

    const validated = barberSchema.safeParse(data);

    if (!validated.success) {
        console.log("Validation error:", validated.error);
        return { error: "Dados inválidos. Verifique os campos." };
    }

    try {
        await prisma.barber.create({
            data: {
                name: validated.data.name,
                bio: validated.data.bio || null,
                instagram: validated.data.instagram || null,
                imageUrl: validated.data.imageUrl || null,
                barbershopId: barbershopId,
            },
        });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro adicionado com sucesso!" };
    } catch (error) {
        console.error("Erro ao criar barbeiro:", error);
        return { error: `Erro ao criar barbeiro: ${(error as Error).message}` };
    }
}

export async function updateBarber(id: string, formData: FormData) {
    const imageFile = formData.get("imageFile") as File;
    let imageUrl = undefined;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const uploadDir = join(process.cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imageUrl = `/uploads/${filename}`;
        } catch (error) {
            console.error("Erro ao salvar imagem:", error);
            return { error: "Erro ao salvar imagem do barbeiro." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        instagram: formData.get("instagram") as string,
        imageUrl: imageUrl || (formData.get("imageUrl") as string),
    };

    const validated = barberSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Dados inválidos." };
    }

    try {
        await prisma.barber.update({
            where: { id },
            data: {
                name: validated.data.name,
                bio: validated.data.bio || null,
                instagram: validated.data.instagram || null,
                imageUrl: validated.data.imageUrl || null,
            },
        });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro atualizado com sucesso!" };
    } catch (error) {
        return { error: "Erro ao atualizar barbeiro." };
    }
}

export async function deleteBarber(id: string) {
    try {
        await prisma.barber.delete({ where: { id } });
        revalidatePath("/dashboard/barbers");
        revalidatePath("/");
        return { success: "Barbeiro removido com sucesso!" };
    } catch (error) {
        return { error: "Erro ao remover barbeiro." };
    }
}

export async function deleteUser(id: string) {
    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath("/dashboard/clients");
        return { success: "Usuário removido com sucesso!" };
    } catch (error) {
        console.error("Erro ao remover usuário:", error);
        return { error: "Erro ao remover usuário." };
    }
}

export async function updateAppointmentStatus(id: string, status: string) {
    try {
        await prisma.appointment.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/dashboard/appointments");
        return { success: "Status atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar agendamento:", error);
        return { error: "Erro ao atualizar status." };
    }
}

export async function updateAppointmentStatusVoid(id: string, status: string) {
    await updateAppointmentStatus(id, status);
}

export async function updateProfile(formData: FormData) {
    console.log("updateProfile iniciado");
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado." };

    const imageFile = formData.get("imageFile") as File;
    let imagePath = undefined;

    if (imageFile && imageFile.size > 0) {
        try {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sanitizar nome do arquivo e adicionar timestamp
            const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
            const uploadDir = join(process.cwd(), "public", "uploads");
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            imagePath = `/uploads/${filename}`;
        } catch (error) {
            console.error("Erro ao salvar imagem:", error);
            return { error: "Erro ao salvar imagem de perfil." };
        }
    }

    const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        cpf: formData.get("cpf") as string,
        phone: formData.get("phone") as string,
        birthDate: formData.get("birthDate") as string,
    };

    if (!data.name || !data.email) {
        return { error: "Nome e Email são obrigatórios." };
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                phone: data.phone,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                ...(imagePath && { image: imagePath }), // Só atualiza se tiver nova imagem
            },
        });
        revalidatePath("/dashboard/profile");
        return { success: "Perfil atualizado com sucesso!" };
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return { error: "Erro ao atualizar perfil." };
    }
}
