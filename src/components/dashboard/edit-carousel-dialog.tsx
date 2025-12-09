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
import { Pencil, Camera } from "lucide-react";
import { updateCarouselItem } from "@/actions/carousel";
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

interface CarouselItem {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    order: number;
}

export function EditCarouselDialog({ item }: { item: CarouselItem }) {
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(item.imageUrl);

    // Determinar o tipo de link inicial
    const initialLinkType = LINK_OPTIONS.find(opt => opt.value === item.ctaLink)?.value || "custom";
    const [linkType, setLinkType] = useState(initialLinkType);
    const [customLink, setCustomLink] = useState(initialLinkType === "custom" ? item.ctaLink : "");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    async function handleSubmit(formData: FormData) {
        if (linkType === "custom") {
            formData.set("ctaLink", customLink);
        } else {
            formData.set("ctaLink", linkType);
        }

        const result = await updateCarouselItem(item.id, formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Slide atualizado com sucesso!");
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10 h-8 w-8">
                    <Pencil size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Slide</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Faça alterações no slide.
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
                                <img src={preview || ""} alt="Preview" className="w-full h-full object-cover" />
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
                            />
                        </div>

                        {/* Título e Subtítulo */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Título Principal</Label>
                            <Input id="title" name="title" defaultValue={item.title} className="bg-zinc-800 border-zinc-700 text-white" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtítulo</Label>
                            <Textarea id="subtitle" name="subtitle" defaultValue={item.subtitle || ""} className="bg-zinc-800 border-zinc-700 text-white" />
                        </div>

                        {/* Botão de Ação */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ctaText">Texto do Botão</Label>
                                <Input id="ctaText" name="ctaText" defaultValue={item.ctaText} className="bg-zinc-800 border-zinc-700 text-white" required />
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

                        {/* Link Customizado */}
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
                            <Input id="order" name="order" type="number" defaultValue={item.order} className="bg-zinc-800 border-zinc-700 text-white" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400 w-full">
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
