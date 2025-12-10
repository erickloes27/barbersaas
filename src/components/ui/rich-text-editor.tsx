"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading2, Code } from "lucide-react";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    variables?: string[];
}

export function RichTextEditor({ content, onChange, variables = [] }: RichTextEditorProps) {
    const [htmlInput, setHtmlInput] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: content,
        immediatelyRender: false, // Fix for SSR hydration mismatch
        editorProps: {
            attributes: {
                class: 'min-h-[200px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white prose prose-invert max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update content if it changes externally (e.g. initial load)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            // Only set content if it's significantly different to avoid cursor jumping
            // For simple use cases, this might be enough, but be careful with loops
            // editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const addVariable = (variable: string) => {
        editor.chain().focus().insertContent(` ${variable} `).run();
    };

    const handleImportHtml = () => {
        if (htmlInput) {
            editor.commands.setContent(htmlInput);
            onChange(htmlInput);
            setIsDialogOpen(false);
            setHtmlInput("");
        }
    };

    return (
        <div className="space-y-2">
            {/* Variable Chips */}
            {variables.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-zinc-900/50 rounded-md border border-zinc-800">
                    <span className="text-xs text-zinc-500 flex items-center mr-2">Variáveis:</span>
                    {variables.map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => addVariable(v)}
                            className="text-xs bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 px-2 py-1 rounded-full transition-colors font-mono"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-1 bg-zinc-900 rounded-t-md border border-zinc-700 border-b-0 items-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-zinc-700 mx-1" />

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white gap-1"
                        >
                            <Code className="h-4 w-4" />
                            <span className="text-xs">HTML</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Importar HTML</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">Cole seu código HTML abaixo. Isso substituirá o conteúdo atual.</p>
                            <Textarea
                                value={htmlInput}
                                onChange={(e) => setHtmlInput(e.target.value)}
                                placeholder="<p>Seu código aqui...</p>"
                                className="min-h-[200px] font-mono bg-zinc-800 border-zinc-700"
                            />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 text-white hover:bg-zinc-800">Cancelar</Button>
                                <Button onClick={handleImportHtml} className="bg-yellow-500 text-black hover:bg-yellow-400">Importar</Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
