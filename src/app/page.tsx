import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function Home() {
  const barbershops = await prisma.barbershop.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">Barber SaaS</h1>
          <p className="text-zinc-400 text-lg">Encontre a melhor barbearia para você.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barbershops.map((shop) => (
            <Card key={shop.id} className="bg-zinc-900 border-zinc-800 text-white hover:border-amber-400/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {shop.logoUrl && (
                      <div className="h-10 w-10 rounded-lg overflow-hidden relative border border-zinc-700 bg-zinc-800">
                        <img src={shop.logoUrl} alt={shop.name} className="object-cover h-full w-full" />
                      </div>
                    )}
                    <span>{shop.name}</span>
                  </div>
                </CardTitle>
                <p className="text-sm text-zinc-500">/{shop.slug}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-zinc-400">
                    <p>{shop.city || "Localização não informada"} - {shop.state || "UF"}</p>
                    <p>{shop.phone}</p>
                  </div>
                  <Button asChild className="w-full bg-amber-400 text-black hover:bg-amber-500">
                    <Link href={`/${shop.slug}`}>
                      Visitar Barbearia
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
