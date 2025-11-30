"use client"

import { useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TimeRevenueChartProps {
    dailyData: { name: string; total: number }[]
    weeklyData: { name: string; total: number }[]
    monthlyData: { name: string; total: number }[]
}

export function TimeRevenueChart({ dailyData, weeklyData, monthlyData }: TimeRevenueChartProps) {
    const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

    const data = {
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
    }[period]

    return (
        <Card className="col-span-1 md:col-span-2 bg-zinc-900 border-zinc-800 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Evolução da Receita</CardTitle>
                <Tabs defaultValue="daily" className="w-[400px]" onValueChange={(v) => setPeriod(v as any)}>
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                        <TabsTrigger value="daily" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Diário</TabsTrigger>
                        <TabsTrigger value="weekly" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Semanal</TabsTrigger>
                        <TabsTrigger value="monthly" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-400">Mensal</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: '#27272a' }}
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                            />
                            <Bar
                                dataKey="total"
                                fill="#fbbf24"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
