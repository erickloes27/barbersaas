import { Header } from "@/components/header";
// Trigger TS re-check
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { Barbers } from "@/components/barbers";
import { Footer } from "@/components/footer";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface BarbershopPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BarbershopPage({ params }: BarbershopPageProps) {
    const { slug } = await params;

    const barbershop = await prisma.barbershop.findUnique({
        where: { slug },
    });

    if (!barbershop) {
        return notFound();
    }

    const [services, barbers, carouselItems] = await Promise.all([
        prisma.service.findMany({
            where: { barbershopId: barbershop.id },
            orderBy: { order: "asc" }
        }),
        prisma.barber.findMany({
            where: { barbershopId: barbershop.id },
            orderBy: { createdAt: "asc" }
        }),
        prisma.carouselItem.findMany({
            where: { barbershopId: barbershop.id },
            orderBy: { order: "asc" }
        }),
    ]);

    const formattedServices = services.map((service) => ({
        ...service,
        price: Number(service.price),
    }));

    return (
        <main className="min-h-screen bg-black text-white">
            <Header barbershopName={barbershop.name} barbershopLogo={barbershop.logoUrl} />
            <Hero slides={carouselItems} />
            <Services services={formattedServices} />
            <Barbers barbers={barbers} />
            <Footer settings={barbershop} />
        </main>
    );
}
