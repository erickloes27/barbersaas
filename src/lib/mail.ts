import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendPasswordResetEmail(email: string, token: string) {
    // Fallback para desenvolvimento ou se não houver chave API
    if (!resend) {
        console.log("========================================");
        console.log(`📧 [MOCK EMAIL] Para: ${email}`);
        console.log(`🔑 Código de Recuperação: ${token}`);
        console.log("========================================");
        return { success: true, mock: true };
    }

    try {
        await resend.emails.send({
            from: 'BarberSaaS <onboarding@resend.dev>',
            to: email,
            subject: 'Recuperação de Senha - BarberSaaS',
            html: `
        <h1>Recuperação de Senha</h1>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Seu código de verificação é: <strong>${token}</strong></p>
        <p>Este código expira em 1 hora.</p>
      `
        });
        return { success: true };
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        return { success: false, error };
    }
}
