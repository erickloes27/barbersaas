import { getEmailTemplate } from "@/actions/email";
import { EditTemplateForm } from "@/components/dashboard/edit-template-form";

interface PageProps {
    params: Promise<{
        type: string;
    }>;
}

const ALL_VARS = ["{{name}}", "{{date}}", "{{time}}", "{{barbershopName}}", "{{serviceName}}", "{{barberName}}"];

const templateInfo: Record<string, { name: string, vars: string[] }> = {
    "WELCOME": { name: "Boas-vindas", vars: ALL_VARS },
    "APPOINTMENT_REMINDER": { name: "Confirmação de Agendamento", vars: ALL_VARS },
    "PASSWORD_RESET": { name: "Recuperação de Senha", vars: ALL_VARS }
};

export default async function EditTemplatePage({ params }: PageProps) {
    const { type } = await params;
    const info = templateInfo[type];
    const template = await getEmailTemplate(type);

    if (!info) return <div>Template não encontrado</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Editar: {info.name}</h2>
                <p className="text-zinc-400">Personalize o assunto e conteúdo deste e-mail.</p>
            </div>

            <EditTemplateForm
                type={type}
                initialSubject={template?.subject || ""}
                initialContent={template?.content || ""}
                vars={info.vars}
            />
        </div>
    );
}
