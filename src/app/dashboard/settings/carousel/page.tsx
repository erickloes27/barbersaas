import { getCarouselItems } from "@/actions/carousel";
import { CarouselList } from "@/components/dashboard/carousel-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AddCarouselDialog } from "@/components/dashboard/add-carousel-dialog";

interface CarouselSettingsPageProps {
    searchParams: Promise<{
        barbershopId?: string;
    }>;
}

export default async function CarouselSettingsPage({ searchParams }: CarouselSettingsPageProps) {
    const { barbershopId } = await searchParams;
    const items = await getCarouselItems(barbershopId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Carrossel da Home</h2>
                    <p className="text-zinc-400">Gerencie os slides e promoções da página inicial.</p>
                </div>
                <AddCarouselDialog />
            </div>

            <CarouselList items={items} />
        </div>
    );
}
