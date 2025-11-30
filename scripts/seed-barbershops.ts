import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    const barbershops = await prisma.barbershop.findMany();

    console.log(`Found ${barbershops.length} barbershops.`);

    for (const shop of barbershops) {
        console.log(`Processing barbershop: ${shop.name} (${shop.id})`);

        // 1. Services
        const servicesCount = await prisma.service.count({ where: { barbershopId: shop.id } });
        if (servicesCount === 0) {
            console.log("  - Adding services...");
            await prisma.service.createMany({
                data: [
                    {
                        name: "Corte de Cabelo",
                        description: "Corte moderno com acabamento na navalha e lavagem.",
                        price: 45.00,
                        duration: 45,
                        icon: "Scissors",
                        imageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        name: "Barba Completa",
                        description: "Modelagem de barba com toalha quente e balm hidratante.",
                        price: 35.00,
                        duration: 30,
                        icon: "Scissors", // Using Scissors as generic, or maybe Zap/User if available in frontend mapping
                        imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        name: "Combo Corte + Barba",
                        description: "O pacote completo para o seu visual.",
                        price: 70.00,
                        duration: 75,
                        icon: "Scissors",
                        imageUrl: "https://images.unsplash.com/photo-1503951914875-befbb6470523?w=800&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        name: "Pezinho / Acabamento",
                        description: "Apenas o acabamento e contorno.",
                        price: 15.00,
                        duration: 15,
                        icon: "Scissors",
                        imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
                        barbershopId: shop.id,
                    },
                ],
            });
        } else {
            console.log("  - Services already exist, skipping.");
        }

        // 2. Barbers
        const barbersCount = await prisma.barber.count({ where: { barbershopId: shop.id } });
        if (barbersCount === 0) {
            console.log("  - Adding barbers...");
            await prisma.barber.createMany({
                data: [
                    {
                        name: "Carlos Silva",
                        bio: "Especialista em cortes clássicos e barba lenhador.",
                        instagram: "@carlos.barber",
                        imageUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        name: "Rafael Costa",
                        bio: "Mestre em degradê e cortes modernos.",
                        instagram: "@rafa.cuts",
                        imageUrl: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=800&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        name: "André Santos",
                        bio: "Barbeiro com 10 anos de experiência.",
                        instagram: "@andre.barber",
                        imageUrl: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=800&q=80",
                        barbershopId: shop.id,
                    },
                ],
            });
        } else {
            console.log("  - Barbers already exist, skipping.");
        }

        // 3. Carousel Items (Promotions)
        const carouselCount = await prisma.carouselItem.count({ where: { barbershopId: shop.id } });
        if (carouselCount === 0) {
            console.log("  - Adding carousel items...");
            await prisma.carouselItem.createMany({
                data: [
                    {
                        title: "Segunda do Barato",
                        subtitle: "Corte com 20% de desconto todas as segundas!",
                        ctaText: "Agendar Agora",
                        ctaLink: "/dashboard/book",
                        imageUrl: "https://images.unsplash.com/photo-1512690459411-b9245aed8ad5?w=1200&q=80",
                        barbershopId: shop.id,
                    },
                    {
                        title: "Dia do Noivo",
                        subtitle: "Prepare-se para o grande dia com estilo.",
                        ctaText: "Saiba Mais",
                        ctaLink: "#",
                        imageUrl: "https://images.unsplash.com/photo-1507081323647-4d250478b919?w=1200&q=80",
                        barbershopId: shop.id,
                    },
                ],
            });
        } else {
            console.log("  - Carousel items already exist, skipping.");
        }
    }

    console.log("✅ Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
