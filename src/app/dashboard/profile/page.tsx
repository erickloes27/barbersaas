import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        return <div>Não autorizado</div>;
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return <div>Usuário não encontrado</div>;
    }

    const serializedUser = {
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        birthDate: user.birthDate, // Next.js 15+ pode lidar com Date, mas vamos garantir
        image: user.image,
    };

    return (
        <div className="flex flex-col items-center space-y-8">
            <div className="w-full max-w-2xl flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white">Meu Perfil</h2>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 text-white w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProfileForm user={serializedUser} />
                </CardContent>
            </Card>
        </div>
    );
}
