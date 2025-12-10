import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";

export default async function MarketingPage() {
    const session = await auth();
    if (!session?.user?.barbershopId) redirect("/login");

    const campaigns = await prisma.marketingCampaign.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { createdAt: "desc" }
    });

    return (
        <PageContainer>
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Marketing</h2>
                <Button asChild className="bg-yellow-500 text-black hover:bg-yellow-400">
                    <Link href="/dashboard/marketing/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Campanha
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {campaign.subject}
                            </CardTitle>
                            <Mail className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{campaign.recipientCount}</div>
                            <p className="text-xs text-zinc-400">
                                Enviados em {new Date(campaign.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                        </CardContent>
                    </Card>
                ))}
                {campaigns.length === 0 && (
                    <div className="col-span-full text-center py-12 text-zinc-500">
                        Nenhuma campanha enviada ainda.
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
