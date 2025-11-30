
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const dateParam = "2025-11-29"; // Data de "Hoje" que sabemos que tem agendamento pelo seed

    console.log(`Testando query para data: ${dateParam}`);

    const start = new Date(dateParam + "T00:00:00");
    const end = new Date(dateParam + "T23:59:59");

    console.log("Start (Local/Server):", start.toString());
    console.log("End (Local/Server):", end.toString());
    console.log("Start (ISO):", start.toISOString());
    console.log("End (ISO):", end.toISOString());

    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: start,
                lte: end,
            },
        },
    });

    console.log(`Encontrados: ${appointments.length}`);
    appointments.forEach(a => {
        console.log(`- ID: ${a.id}, Date: ${a.date.toISOString()} (Local: ${a.date.toString()})`);
    });

    // Verificar o que tem no banco perto dessa data
    console.log("\n--- Verificando todos os agendamentos ---");
    const all = await prisma.appointment.findMany();
    all.forEach(a => {
        console.log(`All - Date: ${a.date.toISOString()}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
