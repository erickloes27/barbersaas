import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding default schedule...");

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

    const defaultSchedule = [
        { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", active: false, barbershopId: barbershop.id }, // Domingo (Fechado)
        { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true, pauseStart: "12:00", pauseEnd: "13:00", barbershopId: barbershop.id }, // Segunda
        { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", active: true, pauseStart: "12:00", pauseEnd: "13:00", barbershopId: barbershop.id }, // Terça
        { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", active: true, pauseStart: "12:00", pauseEnd: "13:00", barbershopId: barbershop.id }, // Quarta
        { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", active: true, pauseStart: "12:00", pauseEnd: "13:00", barbershopId: barbershop.id }, // Quinta
        { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", active: true, pauseStart: "12:00", pauseEnd: "13:00", barbershopId: barbershop.id }, // Sexta
        { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", active: true, barbershopId: barbershop.id }, // Sábado
    ];

    for (const day of defaultSchedule) {
        await prisma.daySchedule.upsert({
            where: {
                barbershopId_dayOfWeek: {
                    barbershopId: barbershop.id,
                    dayOfWeek: day.dayOfWeek,
                }
            },
            update: day,
            create: day,
        });
    }

    console.log("Schedule seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
