import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

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

    // 1. Services
    const services = [
        { name: "Corte de Cabelo", price: 35.00, duration: 30, description: "Corte moderno ou clássico", barbershopId: barbershop.id },
        { name: "Barba", price: 25.00, duration: 20, description: "Modelagem e hidratação", barbershopId: barbershop.id },
        { name: "Cabelo + Barba", price: 55.00, duration: 50, description: "Combo completo", barbershopId: barbershop.id },
        { name: "Pezinho", price: 10.00, duration: 10, description: "Acabamento", barbershopId: barbershop.id },
    ];

    for (const s of services) {
        const existing = await prisma.service.findFirst({ where: { name: s.name, barbershopId: barbershop.id } });
        if (!existing) {
            await prisma.service.create({ data: s });
            console.log(`Service created: ${s.name}`);
        } else {
            console.log(`Service already exists: ${s.name}`);
        }
    }

    // 2. Barbers
    const barbers = [
        { name: "João Barbeiro", bio: "Especialista em cortes clássicos.", barbershopId: barbershop.id },
        { name: "Carlos Navalha", bio: "Mestre em degradê e barba.", barbershopId: barbershop.id },
    ];

    for (const b of barbers) {
        const existing = await prisma.barber.findFirst({ where: { name: b.name, barbershopId: barbershop.id } });
        if (!existing) {
            await prisma.barber.create({ data: b });
            console.log(`Barber created: ${b.name}`);
        } else {
            console.log(`Barber already exists: ${b.name}`);
        }
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
