import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/dashboard/booking-wizard";

export const dynamic = "force-dynamic";

export default async function BookPage() {
    const servicesData = await prisma.service.findMany({
        orderBy: { order: "asc" },
    });
    console.log(`[BookPage] Found ${servicesData.length} services`);

    // Serializar Decimal para Number
    const services = servicesData.map(service => ({
        ...service,
        price: Number(service.price)
    }));

    const barbers = await prisma.barber.findMany({
        orderBy: { createdAt: "asc" },
    });
    console.log(`[BookPage] Found ${barbers.length} barbers`);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Novo Agendamento</h2>
                    <p className="text-zinc-400">Agende seu horário em poucos passos.</p>
                </div>
            </div>

            <BookingWizard services={services} barbers={barbers} />
        </div>
    );
}
