"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Camera } from "lucide-react";
import { createCarouselItem } from "@/app/carousel-actions";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const LINK_OPTIONS = [
    { label: "Agendar (Login)", value: "/login" },
    { label: "Nossos Serviços", value: "#servicos" },
    { label: "Nossos Barbeiros", value: "#barbeiros" },
    { label: "Contato / Localização", value: "#contato" },
    { label: "Outro (Customizado)", value: "custom" },
];

export function AddCarouselDialog() {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [linkType, setLinkType] = useState("/login");
    const [customLink, setCustomLink] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    async function handleSubmit(formData: FormData) {
        // Ajustar o link final
        if (linkType === "custom") {
            formData.set("ctaLink", customLink);
        } else {
            formData.set("ctaLink", linkType);
        }

        const result = await createCarouselItem(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Slide criado com sucesso!");
            setOpen(false);
            setPreview(null);
            setLinkType("/login");
            setCustomLink("");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Novo Slide
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Adicionar Slide</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Crie um novo destaque para a página inicial.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Upload de Imagem */}
                        <div className="flex flex-col space-y-2">
                            <Label>Imagem de Fundo</Label>
                            <div
                                className="relative w-full h-40 bg-zinc-800 rounded-md border-2 border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors overflow-hidden group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-500">
                                        <Camera className="h-8 w-8 mb-2" />
                                        <span className="text-sm">Clique para enviar imagem</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                                required
                            />
                        </div>

                        {/* Título e Subtítulo */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Título Principal</Label>
                            <Input id="title" name="title" className="bg-zinc-800 border-zinc-700 text-white" required placeholder="Ex: Estilo & Tradição" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtítulo</Label>
                            <Textarea id="subtitle" name="subtitle" className="bg-zinc-800 border-zinc-700 text-white" placeholder="Ex: O melhor corte da cidade..." />
                        </div>

                        {/* Botão de Ação */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ctaText">Texto do Botão</Label>
                                <Input id="ctaText" name="ctaText" className="bg-zinc-800 border-zinc-700 text-white" required placeholder="Ex: Agendar Agora" />
                            </div>
                            <div className="space-y-2">
                                <Label>Destino do Botão</Label>
                                <Select value={linkType} onValueChange={setLinkType}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                        {LINK_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Link Customizado (Condicional) */}
                        {linkType === "custom" && (
                            <div className="space-y-2">
                                <Label htmlFor="customLink">URL Personalizada</Label>
                                <Input
                                    id="customLink"
                                    value={customLink}
                                    onChange={(e) => setCustomLink(e.target.value)}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                        )}

                        {/* Ordem */}
                        <div className="space-y-2">
                            <Label htmlFor="order">Ordem de Exibição</Label>
                            <Input id="order" name="order" type="number" defaultValue="0" className="bg-zinc-800 border-zinc-700 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400 w-full">
                            Criar Slide
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
