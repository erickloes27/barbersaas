import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding carousel items...");

    // Ensure a barbershop exists
    let barbershop = await prisma.barbershop.findFirst();
    if (!barbershop) {
        barbershop = await prisma.barbershop.create({
            data: {
                name: "Barber SaaS",
                slug: "barber-saas",
                primaryColor: "#fbbf24",
                secondaryColor: "#18181b",
            }
        });
        console.log("Created default barbershop");
    }

    const slides = [
        {
            title: "Estilo & Tradição",
            subtitle: "O melhor corte da cidade, feito por quem entende.",
            ctaText: "Agendar Corte",
            ctaLink: "/login",
            imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
            order: 1,
            barbershopId: barbershop.id,
        },
        {
            title: "Barba de Respeito",
            subtitle: "Tratamento completo com toalha quente e navalha.",
            ctaText: "Cuidar da Barba",
            ctaLink: "/dashboard/services",
            imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
            order: 2,
            barbershopId: barbershop.id,
        },
        {
            title: "Dia do Noivo",
            subtitle: "Pacotes especiais para o seu grande dia.",
            ctaText: "Ver Pacotes",
            ctaLink: "/dashboard/services",
            imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
            order: 3,
            barbershopId: barbershop.id,
        },
    ];

    for (const slide of slides) {
        await prisma.carouselItem.create({
            data: slide,
        });
    }

    console.log("Slides added successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
