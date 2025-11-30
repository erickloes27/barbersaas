import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Sale {
    id: string
    user: {
        name: string | null
        email: string | null
        image: string | null
    }
    service: {
        name: string
        price: number // Prisma Decimal returns as number in JS runtime usually, or Decimal object. We'll handle conversion in parent.
    }
    date: Date
}

interface RecentSalesProps {
    sales: Sale[]
}

export function RecentSales({ sales }: RecentSalesProps) {
    if (sales.length === 0) {
        return <div className="text-sm text-muted-foreground">Nenhum agendamento recente.</div>
    }

    return (
        <div className="space-y-8">
            {sales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={sale.user.image || undefined} alt="Avatar" />
                        <AvatarFallback>{sale.user.name?.charAt(0).toUpperCase() || "C"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{sale.user.name || "Cliente"}</p>
                        <p className="text-sm text-muted-foreground">
                            {sale.service.name}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-white">
                        +R$ {Number(sale.service.price).toFixed(2).replace('.', ',')}
                    </div>
                </div>
            ))}
        </div>
    )
}
