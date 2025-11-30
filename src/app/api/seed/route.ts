import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const email = "admin@barber.com";
        const password = await bcrypt.hash("123456", 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password,
                role: "ADMIN",
            },
            create: {
                email,
                name: "Admin User",
                password,
                role: "ADMIN",
                cpf: "000.000.000-00",
                phone: "(11) 99999-9999",
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
