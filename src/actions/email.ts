"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Helper to get verified sender or fallback
const getSender = () => {
    // In production, this should be a verified domain like "noreply@barbersaas.com"
    // For testing/dev without domain, use "onboarding@resend.dev" which only sends to the account owner
    return "onboarding@resend.dev";
};

export async function sendMarketingEmail(subject: string, content: string) {
    const session = await auth();
    if (!session?.user?.barbershopId) return { error: "Não autorizado" };

    if (!resend) {
        console.error("Resend API Key missing");
        return { error: "Serviço de e-mail não configurado (API Key ausente)." };
    }

    const barbershopId = session.user.barbershopId;

    // Fetch all users of this barbershop
    const users = await prisma.user.findMany({
        where: {
            barbershopId,
            role: "USER",
            email: { not: null }
        },
        select: { email: true, name: true }
    });

    if (users.length === 0) return { error: "Nenhum cliente encontrado para enviar." };

    let sentCount = 0;
    const errors = [];

    // In a real production app, we should use a queue (like Redis/BullMQ) or Resend's batch API
    // For this MVP, we'll loop (careful with timeouts on Vercel free tier)
    // We'll limit to 50 for safety in this MVP
    const batch = users.slice(0, 50);

    for (const user of batch) {
        if (!user.email) continue;
        try {
            await resend.emails.send({
                from: getSender(),
                to: user.email,
                subject: subject,
                html: content.replace("{{name}}", user.name || "Cliente"),
            });
            sentCount++;
        } catch (err) {
            console.error(`Failed to send to ${user.email}`, err);
            errors.push(user.email);
        }
    }

    // Record campaign
    await prisma.marketingCampaign.create({
        data: {
            barbershopId,
            subject,
            content,
            recipientCount: sentCount
        }
    });

    revalidatePath("/dashboard/marketing");
    return {
        success: true,
        sent: sentCount,
        total: users.length,
        note: users.length > 50 ? "Limitado a 50 envios por vez neste MVP." : undefined
    };
}

export async function getEmailTemplate(type: string) {
    const session = await auth();
    if (!session?.user?.barbershopId) return null;

    const template = await prisma.emailTemplate.findUnique({
        where: {
            barbershopId_type: {
                barbershopId: session.user.barbershopId,
                type
            }
        }
    });

    return template;
}

export async function updateEmailTemplate(type: string, subject: string, content: string) {
    const session = await auth();
    if (!session?.user?.barbershopId) return { error: "Não autorizado" };

    await prisma.emailTemplate.upsert({
        where: {
            barbershopId_type: {
                barbershopId: session.user.barbershopId,
                type
            }
        },
        update: { subject, content },
        create: {
            barbershopId: session.user.barbershopId,
            type,
            subject,
            content
        }
    });

    revalidatePath("/dashboard/settings/email");
    return { success: true };
}

// System Email Sender
export async function sendSystemEmail(
    type: "WELCOME" | "PASSWORD_RESET" | "APPOINTMENT_REMINDER",
    user: { email: string | null, name: string | null },
    data: Record<string, string>,
    barbershopId: string
) {
    if (!user.email) return;

    if (!resend) {
        console.warn("Resend API Key missing. Skipping email.");
        return;
    }

    // 1. Try to find custom template
    const template = await prisma.emailTemplate.findUnique({
        where: {
            barbershopId_type: {
                barbershopId,
                type
            }
        }
    });

    // 2. Fallback defaults
    let subject = template?.subject;
    let content = template?.content;

    if (!subject || !content) {
        switch (type) {
            case "WELCOME":
                subject = "Bem-vindo à Barbearia!";
                content = "<p>Olá {{name}}, seja bem-vindo!</p>";
                break;
            case "PASSWORD_RESET":
                subject = "Recuperação de Senha";
                content = "<p>Olá {{name}}, clique aqui para recuperar sua senha.</p>";
                break;
            case "APPOINTMENT_REMINDER":
                subject = "Lembrete de Agendamento";
                content = "<p>Olá {{name}}, você tem um agendamento dia {{date}} às {{time}}.</p>";
                break;
        }
    }

    // 3. Replace variables
    // Common vars: {{name}}
    let finalContent = content!.replace(/{{name}}/g, user.name || "Cliente");
    let finalSubject = subject!.replace(/{{name}}/g, user.name || "Cliente");

    // Specific vars
    Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        finalContent = finalContent.replace(regex, value);
        finalSubject = finalSubject.replace(regex, value);
    });

    // 4. Send
    try {
        await resend.emails.send({
            from: getSender(),
            to: user.email,
            subject: finalSubject,
            html: finalContent,
        });
        console.log(`Email ${type} sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send system email ${type}`, error);
    }
}
