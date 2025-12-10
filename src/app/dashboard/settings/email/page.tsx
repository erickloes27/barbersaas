import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Mail } from "lucide-react";
import Link from "next/link";

const templates = [
    {
        type: "WELCOME",
        name: "Boas-vindas",
        description: "Enviado quando um novo cliente se cadastra.",
        vars: ["{{name}}"]
    },
    {
        type: "APPOINTMENT_REMINDER",
        name: "Confirmação de Agendamento",
        description: "Enviado ao criar um agendamento.",
        vars: ["{{name}}", "{{date}}", "{{time}}", "{{service}}", "{{barber}}"]
    },
    {
        type: "PASSWORD_RESET",
        name: "Recuperação de Senha",
        description: "Enviado quando o cliente solicita troca de senha.",
        vars: ["{{name}}", "{{link}}"]
    }
];

export default function EmailSettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Configuração de E-mails</h2>
                <p className="text-zinc-400">Personalize os e-mails automáticos do sistema.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.type} className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-yellow-500" />
                                {template.name}
                            </CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">
                                <Link href={`/dashboard/settings/email/${template.type}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Personalizar
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
