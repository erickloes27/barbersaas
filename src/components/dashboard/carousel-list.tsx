"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteCarouselItem } from "@/actions/carousel";
import { toast } from "sonner";
import { EditCarouselDialog } from "./edit-carousel-dialog";

interface CarouselItem {
    id: string;
    title: string;
    subtitle: string | null;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    order: number;
}

export function CarouselList({ items }: { items: CarouselItem[] }) {
    async function handleDelete(id: string) {
        if (confirm("Tem certeza que deseja excluir este slide?")) {
            const result = await deleteCarouselItem(id);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Slide removido com sucesso!");
            }
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                <p>Nenhum slide cadastrado.</p>
                <p className="text-sm">Clique em "Novo Slide" para começar.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
                <Card key={item.id} className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                    <div className="relative h-48">
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider mb-1">
                                Ordem: {item.order}
                            </span>
                            <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <p className="text-zinc-400 text-sm line-clamp-2 mb-4 h-10">
                            {item.subtitle || "Sem subtítulo"}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                            <div className="text-xs text-zinc-500">
                                Botão: <span className="text-zinc-300">{item.ctaText}</span>
                            </div>
                            <div className="flex gap-1">
                                <EditCarouselDialog item={item} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
