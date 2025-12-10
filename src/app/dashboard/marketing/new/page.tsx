"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sendMarketingEmail } from "@/actions/email";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Loader2, Send } from "lucide-react";

export default function NewCampaignPage() {
    const [isSending, setIsSending] = useState(false);
    const [content, setContent] = useState("");
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSending(true);
        const subject = formData.get("subject") as string;
        const content = formData.get("content") as string;

        try {
            const result = await sendMarketingEmail(subject, content);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Campanha enviada para ${result.sent} clientes!`);
                if (result.note) toast.info(result.note);
                router.push("/dashboard/marketing");
            }
        } catch (error) {
            toast.error("Erro ao enviar campanha.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Nova Campanha</h2>
                <p className="text-zinc-400">Envie e-mails para todos os seus clientes.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle>Detalhes do E-mail</CardTitle>
                    <CardDescription>Use {'{{name}}'} para substituir pelo nome do cliente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Assunto</label>
                            <Input
                                name="subject"
                                placeholder="Novidades da semana!"
                                required
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Conteúdo</label>
                            <RichTextEditor
                                content={content}
                                onChange={setContent}
                                variables={["{{name}}", "{{date}}", "{{time}}", "{{barbershopName}}", "{{serviceName}}", "{{barberName}}"]}
                            />
                            <input type="hidden" name="content" value={content} />
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                className="bg-zinc-800 text-white hover:bg-zinc-700"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-yellow-500 text-black hover:bg-yellow-400"
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Enviar para Todos
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
