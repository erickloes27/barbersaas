"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateEmailTemplate } from "@/actions/email";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface Props {
    type: string;
    initialSubject: string;
    initialContent: string;
    vars: string[];
}

export function EditTemplateForm({ type, initialSubject, initialContent, vars }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [content, setContent] = useState(initialContent);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        const subject = formData.get("subject") as string;
        const content = formData.get("content") as string;

        try {
            const result = await updateEmailTemplate(type, subject, content);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Template atualizado com sucesso!");
                router.push("/dashboard/settings/email");
            }
        } catch (error) {
            toast.error("Erro ao salvar template.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
                <CardTitle>Conteúdo do E-mail</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                    {vars.map(v => (
                        <span key={v} className="text-xs bg-zinc-800 px-2 py-1 rounded text-yellow-500 font-mono border border-zinc-700">
                            {v}
                        </span>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Assunto</label>
                        <Input
                            name="subject"
                            defaultValue={initialSubject}
                            placeholder="Assunto do e-mail"
                            required
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Conteúdo</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            variables={vars}
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
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
